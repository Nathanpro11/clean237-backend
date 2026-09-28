import { Signalement, Notification, ISignalement, StatutSignalement } from './signalement.types';
import { NotFoundError, BadRequestError } from './signalement.errors';

// ---------- CREATE ----------
export async function creerSignalement(data: {
  description: string;
  citoyenId: string;
  photoUrl?: string;
}): Promise<ISignalement> {
  if (!data.description || data.description.trim().length < 5) {
    throw new BadRequestError('La description doit contenir au moins 5 caractères');
  }
  if (!data.citoyenId) {
    throw new BadRequestError('citoyenId est requis');
  }

  const signalement = await Signalement.create({
    description: data.description,
    citoyenId: data.citoyenId,
    photoUrl: data.photoUrl,
  });

  return signalement;
}


// ---------- READ (tous, avec pagination et tri) ----------
export async function listerSignalements(page: number, limit: number, tri: string) {
  // Combien de signalements on saute avant de commencer (page 1 = 0, page 2 = limit, etc.)
  const nombreASauter = (page - 1) * limit;

  // On recupere les signalements tries, en sautant les premiers, en limitant le nombre
  const signalements = await Signalement.find()
    .sort({ [tri]: -1 })
    .skip(nombreASauter)
    .limit(limit);

  return signalements;
}


// ---------- READ (un seul) ----------
export async function getSignalementParId(id: string): Promise<ISignalement> {
  const signalement = await Signalement.findById(id);
  if (!signalement) throw new NotFoundError('Signalement introuvable');
  return signalement;
}

// ---------- UPDATE ----------
export async function mettreAJourSignalement(
  id: string,
  data: { description?: string; photoUrl?: string }
): Promise<ISignalement> {
  const signalement = await getSignalementParId(id);

  if (data.description) signalement.description = data.description;
  if (data.photoUrl) signalement.photoUrl = data.photoUrl;

  await signalement.save();
  return signalement;
}

// ---------- DELETE ----------
export async function supprimerSignalement(id: string): Promise<void> {
  const result = await Signalement.findByIdAndDelete(id);
  if (!result) throw new NotFoundError('Signalement introuvable');
}

// ---------- Action métier : changer le statut ----------
export async function changerStatutSignalement(
  id: string,
  nouveauStatut: StatutSignalement
): Promise<ISignalement> {
  if (!Object.values(StatutSignalement).includes(nouveauStatut)) {
    throw new BadRequestError('Statut invalide');
  }

  const signalement = await getSignalementParId(id);
  signalement.statut = nouveauStatut;

  // On note ce changement dans l'historique
  signalement.suiviStatuts.push({
    statut: nouveauStatut,
    date: new Date(),
  });
  await signalement.save();



  // On crée une notification simple pour le citoyen
  await Notification.create({
    message: `Statut de votre signalement mis à jour : ${nouveauStatut}`,
    signalementId: signalement._id,
    citoyenId: signalement.citoyenId,
  });

  return signalement;
}



// ---------- Annuler un signalement ----------
export async function annulerSignalement(id: string) {
  const signalement = await getSignalementParId(id);

  // On ne peut annuler que si le signalement n'a pas encore ete traite
  if (signalement.statut !== StatutSignalement.EN_ATTENTE) {
    throw new BadRequestError('Impossible d\'annuler un signalement deja traite');
  }

  await Signalement.findByIdAndDelete(id);
  return { message: 'Signalement annule avec succes' };
}


// ---------- Consulter l'historique des statuts ----------
export async function getHistorique(id: string) {
  const signalement = await getSignalementParId(id);
  return signalement.suiviStatuts;
}

// ---------- Consulter les notifications d'un citoyen ----------
export async function getNotificationsParCitoyen(citoyenId: string) {
  const notifications = await Notification.find({ citoyenId: citoyenId }).sort({ dateEnvoi: -1 });
  return notifications;
}