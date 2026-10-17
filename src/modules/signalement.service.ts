import {
  Signalement,
  Notification,
  Citoyen,
  AgentDeCollecte,
  StatutSignalement,
} from './signalement.types';
import { NotFoundError, BadRequestError } from './signalement.errors';

// ---------- CREATE ----------
export async function creerSignalement(data: {
  description: string;
  citoyenId: string;
  photoUrl: string;
  quartier: string;
  precision?: string;
}) {
  if (!data.description || data.description.trim().length < 5) {
    throw new BadRequestError('La description doit contenir au moins 5 caracteres');
  }
  const nombreDeMots = data.description.trim().split(/\s+/).length;
  if (nombreDeMots > 200) {
    throw new BadRequestError('La description ne doit pas depasser 200 mots');
  }
  if (!data.citoyenId) throw new BadRequestError('citoyenId est requis');
  if (!data.photoUrl) throw new BadRequestError('La photo est obligatoire');
  if (!data.quartier) throw new BadRequestError('Le quartier est obligatoire');

  // On cherche l'agent responsable de ce quartier
  const agent = await AgentDeCollecte.findOne({ zonesAffectees: data.quartier });

  const signalement = await Signalement.create({
    description: data.description,
    citoyenId: data.citoyenId,
    photoUrl: data.photoUrl,
    quartier: data.quartier,
    precision: data.precision,
    agentId: agent ? agent._id : undefined,
  });

  if (agent) {
    await Notification.create({
      message: `Nouveau signalement a ${data.quartier}`,
      signalementId: signalement._id,
      agentId: agent._id,
      destinataire: 'agent',
    });
  }

  return signalement;
}

// ---------- READ (liste generale, pagination + tri) ----------
export async function listerSignalements(page: number, limit: number, tri: string) {
  const nombreASauter = (page - 1) * limit;
  return Signalement.find()
    .sort({ [tri]: -1 })
    .skip(nombreASauter)
    .limit(limit);
}

// ---------- READ (un seul) ----------
export async function getSignalementParId(id: string) {
  const signalement = await Signalement.findById(id);
  if (!signalement) throw new NotFoundError('Signalement introuvable');
  return signalement;
}

// ---------- UPDATE (uniquement si en_attente) ----------
export async function mettreAJourSignalement(
  id: string,
  data: { description?: string; quartier?: string; precision?: string; photoUrl?: string }
) {
  const signalement = await getSignalementParId(id);

  if (signalement.statut !== StatutSignalement.EN_ATTENTE) {
    throw new BadRequestError('Impossible de modifier un signalement deja traite');
  }

  if (data.description) {
    const nombreDeMots = data.description.trim().split(/\s+/).length;
    if (nombreDeMots > 200) throw new BadRequestError('La description ne doit pas depasser 200 mots');
    signalement.description = data.description;
  }
  if (data.quartier) signalement.quartier = data.quartier;
  if (data.precision !== undefined) signalement.precision = data.precision;
  if (data.photoUrl) signalement.photoUrl = data.photoUrl;

  await signalement.save();
  return signalement;
}

// ---------- DELETE ----------
export async function supprimerSignalement(id: string) {
  const result = await Signalement.findByIdAndDelete(id);
  if (!result) throw new NotFoundError('Signalement introuvable');
}

// ---------- Changer le statut (prendre en charge / resoudre / rejeter) ----------
export async function changerStatutSignalement(id: string, nouveauStatut: StatutSignalement, motifRejet?: string) {
  if (!Object.values(StatutSignalement).includes(nouveauStatut)) {
    throw new BadRequestError('Statut invalide');
  }
  if (nouveauStatut === StatutSignalement.REJETE && !motifRejet) {
    throw new BadRequestError('Un motif est requis pour rejeter un signalement');
  }

  const signalement = await getSignalementParId(id);
  signalement.statut = nouveauStatut;
  if (nouveauStatut === StatutSignalement.REJETE) {
    signalement.motifRejet = motifRejet;
  }
  await signalement.save();

  let message = '';
  if (nouveauStatut === StatutSignalement.PRIS_EN_CHARGE) {
    message = 'Votre signalement a ete pris en charge';
  } else if (nouveauStatut === StatutSignalement.RESOLU) {
    message = 'Votre signalement a ete traite. Merci !';
  } else if (nouveauStatut === StatutSignalement.REJETE) {
    message = `Votre signalement a ete rejete. ${motifRejet}`;
  }

  if (message) {
    await Notification.create({
      message,
      signalementId: signalement._id,
      citoyenId: signalement.citoyenId,
      destinataire: 'citoyen',
    });
  }

  return signalement;
}

// ---------- Annuler (uniquement si en_attente) ----------
export async function annulerSignalement(id: string) {
  const signalement = await getSignalementParId(id);

  if (signalement.statut !== StatutSignalement.EN_ATTENTE) {
    throw new BadRequestError('Impossible d\'annuler un signalement deja traite');
  }

  const citoyen = await Citoyen.findById(signalement.citoyenId);
  const nomCitoyen = citoyen ? `${citoyen.prenom} ${citoyen.nom}` : 'un citoyen';

  if (signalement.agentId) {
    await Notification.create({
      message: `Le signalement du citoyen ${nomCitoyen} au quartier ${signalement.quartier} a ete annule`,
      signalementId: signalement._id,
      agentId: signalement.agentId,
      destinataire: 'agent',
    });
  }

  await Signalement.findByIdAndDelete(id);
  return { message: 'Signalement annule avec succes' };
}

// ---------- Archiver (uniquement si resolu ou rejete) ----------
export async function archiverSignalement(id: string) {
  const signalement = await getSignalementParId(id);
  if (signalement.statut !== StatutSignalement.RESOLU && signalement.statut !== StatutSignalement.REJETE) {
    throw new BadRequestError('Seul un signalement resolu ou rejete peut etre archive');
  }
  signalement.archive = true;
  await signalement.save();
  return signalement;
}

// ---------- Mes signalements (citoyen, non archives) ----------
export async function getSignalementsParCitoyen(citoyenId: string, page: number, limit: number) {
  const nombreASauter = (page - 1) * limit;
  return Signalement.find({ citoyenId, archive: false })
    .sort({ dateCreation: -1 })
    .skip(nombreASauter)
    .limit(limit);
}

// ---------- Statistiques d'un citoyen ----------
export async function getStatistiquesCitoyen(citoyenId: string) {
  const enAttente = await Signalement.countDocuments({ citoyenId, statut: StatutSignalement.EN_ATTENTE });
  const prisEnCharge = await Signalement.countDocuments({ citoyenId, statut: StatutSignalement.PRIS_EN_CHARGE });
  const resolu = await Signalement.countDocuments({ citoyenId, statut: StatutSignalement.RESOLU });
  const rejete = await Signalement.countDocuments({ citoyenId, statut: StatutSignalement.REJETE });

  return {
    en_attente: enAttente,
    pris_en_charge: prisEnCharge,
    resolu,
    rejete,
    total: enAttente + prisEnCharge + resolu + rejete,
  };
}

// ---------- A traiter (agent) ----------
export async function getSignalementsParAgent(agentId: string, page: number, limit: number) {
  const nombreASauter = (page - 1) * limit;
  return Signalement.find({
    agentId,
    statut: { $in: [StatutSignalement.EN_ATTENTE, StatutSignalement.PRIS_EN_CHARGE] },
  })
    .sort({ dateCreation: -1 })
    .skip(nombreASauter)
    .limit(limit);
}

// ---------- Historique (agent) ----------
export async function getHistoriqueAgent(agentId: string, page: number, limit: number) {
  const nombreASauter = (page - 1) * limit;
  return Signalement.find({
    agentId,
    statut: { $in: [StatutSignalement.RESOLU, StatutSignalement.REJETE] },
  })
    .sort({ dateCreation: -1 })
    .skip(nombreASauter)
    .limit(limit);
}

// ---------- Notifications ----------
export async function listerNotifications(destinataire?: string) {
  if (destinataire) return Notification.find({ destinataire }).sort({ dateEnvoi: -1 });
  return Notification.find().sort({ dateEnvoi: -1 });
}
export async function getNotificationParId(id: string) {
  const notification = await Notification.findById(id);
  if (!notification) throw new NotFoundError('Notification introuvable');
  return notification;
}
export async function marquerNotificationLue(id: string) {
  const notification = await getNotificationParId(id);
  notification.lu = true;
  await notification.save();
  return notification;
}
export async function supprimerNotification(id: string) {
  const result = await Notification.findByIdAndDelete(id);
  if (!result) throw new NotFoundError('Notification introuvable');
}

// ---------- Aides de test (simulent les modules Citoyen/Agent) ----------
export async function creerCitoyenTest(data: { nom: string; prenom: string; email: string; tel: string }) {
  return Citoyen.create(data);
}
export async function creerAgentTest(data: { matricule: string; zonesAffectees: string[] }) {
  return AgentDeCollecte.create(data);
}