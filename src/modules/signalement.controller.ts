import { Request, Response } from 'express';
import * as signalementService from './signalement.service';
import { AppError } from './signalement.errors';

// Fonction utilitaire pour gérer les erreurs proprement
function handleError(res: Response, error: unknown) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ message: error.message });
  }
  console.error(error);
  return res.status(500).json({ message: 'Erreur interne du serveur' });
}

// CREATE - Créer un signalement
export async function creer(req: Request, res: Response) {
  try {
    const { description, citoyenId, photoUrl } = req.body;
    const signalement = await signalementService.creerSignalement({ description, citoyenId, photoUrl });
    res.status(201).json(signalement);
  } catch (error) {
    handleError(res, error);
  }
}

// READ - Lister tous les signalements
export async function lister(req: Request, res: Response) {
  try {
    const signalements = await signalementService.listerSignalements();
    res.status(200).json(signalements);
  } catch (error) {
    handleError(res, error);
  }
}

// READ - Récupérer un signalement par son id
export async function getParId(req: Request, res: Response) {
  try {
    const signalement = await signalementService.getSignalementParId(req.params.id as string);
    res.status(200).json(signalement);
  } catch (error) {
    handleError(res, error);
  }
}

// UPDATE - Mettre à jour un signalement
export async function mettreAJour(req: Request, res: Response) {
  try {
    const { description, photoUrl } = req.body;
    const signalement = await signalementService.mettreAJourSignalement(req.params.id as string, { description, photoUrl });
    res.status(200).json(signalement);
  } catch (error) {
    handleError(res, error);
  }
}

// DELETE - Supprimer un signalement
export async function supprimer(req: Request, res: Response) {
  try {
    await signalementService.supprimerSignalement(req.params.id as string);
    res.status(204).send();
  } catch (error) {
    handleError(res, error);
  }
}

// Action métier - Changer le statut
export async function changerStatut(req: Request, res: Response) {
  try {
    const { statut } = req.body;
    const signalement = await signalementService.changerStatutSignalement(req.params.id as string, statut);
    res.status(200).json(signalement);
  } catch (error) {
    handleError(res, error);
  }
}