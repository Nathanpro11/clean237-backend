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

// ---------- READ (tous) ----------
export async function listerSignalements(): Promise<ISignalement[]> {
  return Signalement.find().sort({ dateCreation: -1 });
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
  await signalement.save();

  // On crée une notification simple pour le citoyen
  await Notification.create({
    message: `Statut de votre signalement mis à jour : ${nouveauStatut}`,
    signalementId: signalement._id,
    citoyenId: signalement.citoyenId,
  });

  return signalement;
}