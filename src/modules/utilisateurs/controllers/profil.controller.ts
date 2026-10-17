import type { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import bcrypt from "bcrypt";
import Utilisateur from "../models/utilisateur.model";
import Role from "../models/role.model";
import Log from "../models/log.model";
import { inscrireLogAction } from "../utilis/log.util";
import { getPaginationParams } from "../utilis/pagination.util";

const POPULATE_ROLE = { path: "roleId", populate: { path: "permissionsIds", model: "Permission" } };

// Utilisateur de la session courante (restauration de session côté front)
export const getMeController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await (req as any).user.populate(POPULATE_ROLE);
    return res.status(200).json(user);
  } catch (error) { next(error); }
};

export const getUtilisateurByIdController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await Utilisateur.findOne({ _id: req.params.idUser, estActif: true }).populate(POPULATE_ROLE);
    if (!user) throw createHttpError(404, "Utilisateur introuvable ou inactif");
    return res.status(200).json(user);
  } catch (error) { next(error); }
};

// Liste blanche : on ne peut JAMAIS modifier roleId, estActif, email... via cette route.
export const updateSelfController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { nom, telephone, zoneAffectee } = req.body;
    const miseAJour: Record<string, any> = {};
    if (nom !== undefined) miseAJour.nom = nom;
    if (telephone !== undefined) miseAJour.telephone = telephone;
    if (zoneAffectee !== undefined) miseAJour.zoneAffectee = zoneAffectee;

    const user = await Utilisateur.findOneAndUpdate(
      { _id: req.params.idUser, estActif: true },
      miseAJour,
      { returnDocument: "after", runValidators: true }
    ).populate(POPULATE_ROLE);
    if (!user) throw createHttpError(404, "Utilisateur introuvable ou inactif");

    await inscrireLogAction(user._id.toString(), "MODIFICATION_PROFIL", "Mise à jour des informations du profil", req);
    return res.status(200).json({ message: "Profil mis à jour", data: user });
  } catch (error) { next(error); }
};

export const changePasswordController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ancienMotDePasse, nouveauMotDePasse } = req.body;
    if (!ancienMotDePasse || !nouveauMotDePasse) {
      throw createHttpError(400, "Ancien et nouveau mot de passe requis");
    }
    if (String(nouveauMotDePasse).length < 6) {
      throw createHttpError(400, "Nouveau mot de passe : 6 caractères minimum");
    }

    const user = await Utilisateur.findById(req.params.idUser);
    if (!user) throw createHttpError(404, "Utilisateur introuvable");

    const match = await bcrypt.compare(String(ancienMotDePasse), user.motDepasse);
    if (!match) throw createHttpError(400, "L'ancien mot de passe est incorrect");

    const sel = await bcrypt.genSalt(10);
    user.motDepasse = await bcrypt.hash(String(nouveauMotDePasse), sel);
    await user.save();

    await inscrireLogAction(user._id.toString(), "CHANGEMENT_MOT_DE_PASSE", "Mot de passe modifié", req);
    return res.status(200).json({ message: "Votre mot de passe a été modifié avec succès" });
  } catch (error) { next(error); }
};

export const deleteUserController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await Utilisateur.findById(req.params.idUser);
    if (!user) throw createHttpError(404, "Utilisateur introuvable");
    if (user.estActif === false) throw createHttpError(400, "Ce compte utilisateur est déjà désactivé");

    user.estActif = false;
    await user.save();
    return res.status(202).json({ message: "Le compte a été désactivé avec succès" });
  } catch (error) { next(error); }
};

// Liste paginée : le filtre par rôle est appliqué en base (totaux corrects).
export const listerUtilisateursController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { actif, role } = req.query;
    const filtre: Record<string, any> = {};
    if (actif !== undefined) filtre.estActif = actif === "true";

    if (typeof role === "string" && role) {
      const roleDoc = await Role.findOne({ nom: role.toLowerCase() });
      if (!roleDoc) {
        return res.status(200).json({
          pagination: { pageActuelle: 1, limiteParPage: 0, totalElements: 0, totalPages: 0 },
          data: []
        });
      }
      filtre.roleId = roleDoc._id;
    }

    const { skip, limit, page, sort } = getPaginationParams(req);
    const [users, total] = await Promise.all([
      Utilisateur.find(filtre).sort(sort).skip(skip).limit(limit).populate(POPULATE_ROLE),
      Utilisateur.countDocuments(filtre)
    ]);

    return res.status(200).json({
      pagination: {
        pageActuelle: page,
        limiteParPage: limit,
        totalElements: total,
        totalPages: Math.ceil(total / limit)
      },
      data: users
    });
  } catch (error) { next(error); }
};

// RECHERCHE MULTI-CHAMPS (la saisie est échappée : pas de ReDoS)
export const rechercheGlobaleController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { recherche } = req.query;
    if (!recherche || typeof recherche !== "string") {
      throw createHttpError(400, "Le paramètre de recherche est requis");
    }

    const echappe = recherche.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(echappe, "i");
    const resultats = await Utilisateur.find({
      estActif: true,
      $or: [{ nom: regex }, { email: regex }, { matricule: regex }]
    }).populate(POPULATE_ROLE);

    return res.status(200).json({ total: resultats.length, data: resultats });
  } catch (error) { next(error); }
};

export const getDashboardStatsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await Utilisateur.findById(req.params.idUser).populate("roleId");
    if (!user || !user.estActif) throw createHttpError(404, "Utilisateur introuvable");

    const roleNom = String((user.roleId as any)?.nom ?? "citoyen").toLowerCase();
    let statsSpecifiques: Record<string, any> = {};

    if (roleNom === "admin") {
      const roleAgent = await Role.findOne({ nom: "agent" });
      const agentsActifs = roleAgent
        ? await Utilisateur.countDocuments({ roleId: roleAgent._id, estActif: true })
        : 0;

      statsSpecifiques = {
        vueAbonnement: "Vue globale administrative",
        Indicateurs: {
          totalSignalementsYaounde: 142, // TODO : brancher sur le module signalements
          agentsActifsTerrain: agentsActifs,
          alertesSaleteCritiques: 5 // TODO : brancher sur le module alertes
        }
      };
    } else if (roleNom === "agent") {
      statsSpecifiques = {
        vueAbonnement: "Espace terrain agent de collecte",
        Indicateurs: {
          missionsAffectees: 4, // TODO : module missions
          collectesRealiseesAujourdhui: 3,
          zonePriseEnCharge: user.zoneAffectee || "Non assignée"
        }
      };
    } else {
      statsSpecifiques = {
        vueAbonnement: "Portail citoyen standard",
        Indicateurs: { mesSignalementsEmis: 2, pointsFideliteGagnes: 150, quartier: "Yaoundé VI" }
      };
    }

    return res.status(200).json({
      message: `Tableau de bord personnalisé pour le profil [${roleNom}]`,
      proprietaire: user.nom,
      statistiques: statsSpecifiques
    });
  } catch (error) { next(error); }
};

// TRAÇABILITÉ ET HISTORIQUE
export const getHistoriquePersonnelController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const mesActions = await Log.find({ utilisateurId: req.params.idUser }).sort({ createdAt: -1 }).limit(200);

    return res.status(200).json({
      totalActionsEnregistrees: mesActions.length,
      utilisateurCible: req.params.idUser,
      historique: mesActions
    });
  } catch (error) { next(error); }
};