import createHttpError from "http-errors";
import { Types } from "mongoose";
import Role from "../utilisateurs/models/role.model";
import Utilisateur from "../utilisateurs/models/utilisateur.model";
import Log from "../utilisateurs/models/log.model";
import DonneeEnvironnementale from "../administration/models/donneeEnvironnementale.model";
import Zone from "../administration/models/zone.model";
import { Signalement, Notification, STATUTS, type StatutSignalement } from "./signalement.model";

const TRIS_AUTORISES = ["createdAt", "statut", "quartier"];

const roleDe = async (user: any): Promise<string> => {
  const role = await Role.findById(user.roleId);
  return String(role?.nom ?? "citoyen").toLowerCase();
};

const verifierId = (id: string) => {
  if (!Types.ObjectId.isValid(id)) throw createHttpError(400, "Identifiant invalide");
};

const compterMots = (texte: string) => texte.trim().split(/\s+/).length;

const estProprietaire = (s: any, user: any) => String(s.citoyenId) === String(user._id);
const estAgentAssigne = (s: any, user: any) => !!s.agentId && String(s.agentId) === String(user._id);

const notifier = (destinataireId: any, message: string, signalementId?: any) =>
  Notification.create({ destinataireId, message, signalementId });

// Prévient tous les admins actifs (ex. signalement sans agent affecté à la zone).
const notifierAdmins = async (message: string, signalementId?: any) => {
  const roleAdmin = await Role.findOne({ nom: "admin" });
  if (!roleAdmin) return;

  const admins = await Utilisateur.find({ roleId: roleAdmin._id, estActif: true }).select("_id");
  if (admins.length === 0) return;

  await Notification.insertMany(
    admins.map((admin) => ({ destinataireId: admin._id, message, signalementId }))
  );
};

// ---------- Historique (même journal que le module utilisateurs) ----------
const extrait = (texte: string) => (texte.length > 80 ? `${texte.slice(0, 77)}...` : texte);

// L'historique ne doit jamais bloquer l'action elle-même.
const journaliser = async (user: any, action: string, description: string) => {
  try {
    await Log.create({ utilisateurId: user._id, action, description });
  } catch (error) {
    console.error("Historique signalement :", error instanceof Error ? error.message : error);
  }
};

// ---------- Alertes (module administration) ----------
const echapperRegex = (valeur: string) => valeur.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const mettreEnMajuscules = (nom: string) => nom.replace(/(^|[\s-])\S/g, (m) => m.toUpperCase());

const trouverOuCreerZone = async (quartier: string) => {
  const nom = quartier.trim();
  const existante = await Zone.findOne({ nom: new RegExp(`^${echapperRegex(nom)}$`, "i") });
  if (existante) return existante;
  return Zone.create({ nom: mettreEnMajuscules(nom) });
};

// Chaque signalement crée une alerte datée (date + heure) visible par l'admin.
const creerAlerte = async (quartier: string, description: string) => {
  const zone = await trouverOuCreerZone(quartier);
  return DonneeEnvironnementale.create({
    type: "alerte",
    zoneId: zone._id,
    valeur: 1,
    date: new Date(),
    source: "Signalement",
    description: `Dépôt signalé à ${zone.nom} : ${extrait(description)}`,
    statut: "active",
  });
};

// Liste paginée au même format que la liste des utilisateurs.
const paginer = async (filtre: Record<string, any>, query: any, tri = "createdAt") => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 10));
  const champ = TRIS_AUTORISES.includes(tri) ? tri : "createdAt";

  const [data, total] = await Promise.all([
    Signalement.find(filtre).sort({ [champ]: -1 }).skip((page - 1) * limit).limit(limit),
    Signalement.countDocuments(filtre),
  ]);

  return {
    pagination: { pageActuelle: page, limiteParPage: limit, totalElements: total, totalPages: Math.ceil(total / limit) },
    data,
  };
};

const trouver = async (id: string) => {
  verifierId(id);
  const s = await Signalement.findById(id);
  if (!s) throw createHttpError(404, "Signalement introuvable");
  return s;
};

// ---------- Signalements ----------
export const creerSignalement = async (
  user: any,
  data: { description?: string; photoUrl?: string; quartier?: string; precision?: string; latitude?: number; longitude?: number }
) => {
  if (!data.description || data.description.trim().length < 5)
    throw createHttpError(400, "La description doit contenir au moins 5 caractères.");
  if (compterMots(data.description) > 200)
    throw createHttpError(400, "La description ne doit pas dépasser 200 mots.");
  if (!data.photoUrl) throw createHttpError(400, "La photo est obligatoire.");
  if (!data.quartier) throw createHttpError(400, "Le quartier est obligatoire.");
  const aGps = data.latitude !== undefined || data.longitude !== undefined;
  if (aGps && (typeof data.latitude !== "number" || typeof data.longitude !== "number" || Math.abs(data.latitude) > 90 || Math.abs(data.longitude) > 180))
    throw createHttpError(400, "La position GPS est invalide.");

  // Agent actif du rôle "agent" affecté à ce quartier
  const roleAgent = await Role.findOne({ nom: "agent" });
  const agent = roleAgent
    ? await Utilisateur.findOne({
        roleId: roleAgent._id,
        estActif: true,
        zoneAffectee: data.quartier.trim().toLowerCase(),
      })
    : null;

  const signalement = await Signalement.create({
    description: data.description,
    photoUrl: data.photoUrl,
    quartier: data.quartier,
    precision: data.precision,
    latitude: data.latitude,
    longitude: data.longitude,
    citoyenId: user._id,
    agentId: agent?._id,
  });

  // Alerte visible dans la liste de l'admin (le signalement reste créé même si elle échoue)
  try {
    const alerte = await creerAlerte(signalement.quartier, signalement.description);
    signalement.alerteId = alerte._id;
    await signalement.save();
  } catch (error) {
    console.error("Création de l'alerte :", error instanceof Error ? error.message : error);
  }

  if (agent) {
    await notifier(agent._id, `Nouveau signalement à ${signalement.quartier}`, signalement._id);
  } else {
    // Personne ne peut traiter ce signalement : les admins sont prévenus
    await notifierAdmins(
      `Nouveau signalement à ${signalement.quartier} : aucun agent n'est affecté à cette zone`,
      signalement._id
    );
  }

  await journaliser(user, "SIGNALEMENT_CREE", `Signalement créé à ${signalement.quartier} : "${extrait(signalement.description)}"`);
  return signalement;
};

export const listerTous = (query: any) => {
  const filtre: Record<string, any> = {};
  if (typeof query.statut === "string" && (STATUTS as readonly string[]).includes(query.statut)) filtre.statut = query.statut;
  return paginer(filtre, query, typeof query.tri === "string" ? query.tri : "createdAt");
};

export const mesSignalements = (user: any, query: any) =>
  paginer({ citoyenId: user._id, archive: false }, query);

export const mesStatistiques = async (user: any) => {
  const compter = (statut: StatutSignalement) => Signalement.countDocuments({ citoyenId: user._id, statut });
  const [enAttente, prisEnCharge, resolu, rejete] = await Promise.all([
    compter("en_attente"), compter("pris_en_charge"), compter("resolu"), compter("rejete"),
  ]);
  return { en_attente: enAttente, pris_en_charge: prisEnCharge, resolu, rejete, total: enAttente + prisEnCharge + resolu + rejete };
};

export const aTraiter = (user: any, query: any) =>
  paginer({ agentId: user._id, statut: { $in: ["en_attente", "pris_en_charge"] } }, query);

export const historiqueAgent = (user: any, query: any) =>
  paginer({ agentId: user._id, statut: { $in: ["resolu", "rejete"] } }, query);

export const getParId = async (user: any, id: string) => {
  const s = await trouver(id);
  if (estProprietaire(s, user) || estAgentAssigne(s, user) || (await roleDe(user)) === "admin") return s;
  throw createHttpError(403, "Accès refusé : ce signalement ne vous concerne pas.");
};

export const mettreAJour = async (
  user: any,
  id: string,
  data: { description?: string; quartier?: string; precision?: string; photoUrl?: string }
) => {
  const s = await trouver(id);
  if (!estProprietaire(s, user)) throw createHttpError(403, "Seul l'auteur peut modifier son signalement.");
  if (s.statut !== "en_attente") throw createHttpError(400, "Impossible de modifier un signalement déjà traité.");

  if (data.description) {
    if (data.description.trim().length < 5) throw createHttpError(400, "La description doit contenir au moins 5 caractères.");
    if (compterMots(data.description) > 200) throw createHttpError(400, "La description ne doit pas dépasser 200 mots.");
    s.description = data.description;
  }
  if (data.quartier) s.quartier = data.quartier;
  if (data.precision !== undefined) s.precision = data.precision;
  if (data.photoUrl) s.photoUrl = data.photoUrl;
  await s.save();

  if (s.agentId) await notifier(s.agentId, `${user.nom} a modifié son signalement "${s.description}"`, s._id);
  await journaliser(user, "SIGNALEMENT_MODIFIE", `Signalement modifié à ${s.quartier} : "${extrait(s.description)}"`);
  return s;
};

export const annuler = async (user: any, id: string) => {
  const s = await trouver(id);
  if (!estProprietaire(s, user)) throw createHttpError(403, "Seul l'auteur peut annuler son signalement.");
  if (s.statut !== "en_attente") throw createHttpError(400, "Impossible d'annuler un signalement déjà traité.");

  if (s.agentId) await notifier(s.agentId, `${user.nom} a annulé son signalement "${s.description}" (encore en attente)`);
  if (s.alerteId) await DonneeEnvironnementale.findByIdAndDelete(s.alerteId);
  await Signalement.findByIdAndDelete(id);
  await journaliser(user, "SIGNALEMENT_ANNULE", `Signalement annulé à ${s.quartier} : "${extrait(s.description)}"`);
  return { message: "Signalement annulé avec succès." };
};

export const changerStatut = async (user: any, id: string, statut?: string, motifRejet?: string) => {
  if (!statut || !["pris_en_charge", "resolu", "rejete"].includes(statut))
    throw createHttpError(400, "Statut invalide (pris_en_charge, resolu ou rejete).");
  if (statut === "rejete" && !motifRejet) throw createHttpError(400, "Un motif est requis pour rejeter un signalement.");

  const s = await trouver(id);
  if (!estAgentAssigne(s, user) && (await roleDe(user)) !== "admin")
    throw createHttpError(403, "Seul l'agent assigné ou un admin peut changer le statut.");

  s.statut = statut as any;
  if (statut === "rejete") s.motifRejet = motifRejet;
  await s.save();

  // Résolu ou rejeté : l'alerte de l'admin passe en "traitée"
  if ((statut === "resolu" || statut === "rejete") && s.alerteId) {
    await DonneeEnvironnementale.findByIdAndUpdate(s.alerteId, { statut: "traitee" });
  }

  const messages: Record<string, string> = {
    pris_en_charge: `Votre signalement "${s.description}" a été pris en charge`,
    resolu: `Votre signalement "${s.description}" a été résolu`,
    rejete: `Votre signalement "${s.description}" a été rejeté pour : ${motifRejet}`,
  };
  await notifier(s.citoyenId, messages[statut], s._id);

  const actions: Record<string, { code: string; libelle: string }> = {
    pris_en_charge: { code: "SIGNALEMENT_PRIS_EN_CHARGE", libelle: "Signalement pris en charge" },
    resolu: { code: "SIGNALEMENT_RESOLU", libelle: "Signalement résolu" },
    rejete: { code: "SIGNALEMENT_REJETE", libelle: "Signalement rejeté" },
  };
  await journaliser(user, actions[statut].code, `${actions[statut].libelle} à ${s.quartier} : "${extrait(s.description)}"`);
  return s;
};

export const archiver = async (user: any, id: string) => {
  const s = await trouver(id);
  if (!estProprietaire(s, user) && !estAgentAssigne(s, user) && (await roleDe(user)) !== "admin")
    throw createHttpError(403, "Accès refusé : ce signalement ne vous concerne pas.");
  if (s.statut !== "resolu" && s.statut !== "rejete")
    throw createHttpError(400, "Seul un signalement résolu ou rejeté peut être archivé.");
  s.archive = true;
  await s.save();
  await journaliser(user, "SIGNALEMENT_ARCHIVE", `Signalement archivé à ${s.quartier} : "${extrait(s.description)}"`);
  return s;
};

export const supprimer = async (id: string) => {
  verifierId(id);
  const resultat = await Signalement.findByIdAndDelete(id);
  if (!resultat) throw createHttpError(404, "Signalement introuvable");
  if (resultat.alerteId) await DonneeEnvironnementale.findByIdAndDelete(resultat.alerteId);
};

// ---------- Notifications (toujours limitées à l'utilisateur connecté) ----------
export const listerNotifications = async (user: any, query: any) => {
  const filtre: Record<string, any> = { destinataireId: user._id };
  if (query.lu === "true" || query.lu === "false") filtre.lu = query.lu === "true";
  const [data, nonLues] = await Promise.all([
    Notification.find(filtre).sort({ createdAt: -1 }).limit(100),
    Notification.countDocuments({ destinataireId: user._id, lu: false }),
  ]);
  return { nonLues, data };
};

export const marquerLue = async (user: any, id: string) => {
  verifierId(id);
  const n = await Notification.findOneAndUpdate({ _id: id, destinataireId: user._id }, { lu: true }, { new: true });
  if (!n) throw createHttpError(404, "Notification introuvable");
  return n;
};

export const supprimerNotification = async (user: any, id: string) => {
  verifierId(id);
  const n = await Notification.findOneAndDelete({ _id: id, destinataireId: user._id });
  if (!n) throw createHttpError(404, "Notification introuvable");
};

export const marquerToutesLues = async (user: any) => {
  const resultat = await Notification.updateMany({ destinataireId: user._id, lu: false }, { lu: true });
  return { message: "Notifications marquées comme lues.", modifiees: resultat.modifiedCount };
};

// ---------- Traitement depuis le module administration ----------
// Appelée quand l'admin traite l'alerte : le signalement lié passe en "résolu"
// et le citoyen est prévenu. Ne fait rien si le signalement est déjà clos.
export const resoudreDepuisAlerte = async (user: any, alerteId: string) => {
  const s = await Signalement.findOne({ alerteId });
  if (!s || s.statut === "resolu" || s.statut === "rejete") return null;

  s.statut = "resolu";
  await s.save();

  await notifier(s.citoyenId, `Votre signalement "${s.description}" a été résolu`, s._id);
  await journaliser(user, "SIGNALEMENT_RESOLU", `Signalement résolu à ${s.quartier} : "${extrait(s.description)}"`);
  return s;
};
