import { Request, Response } from 'express';
import * as signalementService from './signalement.service';
import { AppError } from './signalement.errors';

// Fonction utilitaire pour gerer les erreurs proprement
function handleError(res: Response, error: unknown) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ message: error.message });
  }
  console.error(error);
  return res.status(500).json({ message: 'Erreur interne du serveur' });
}

// CREATE - Creer un signalement
export async function creer(req: Request, res: Response) {
  try {
    const { description, citoyenId, photoUrl } = req.body;
    const signalement = await signalementService.creerSignalement({ description, citoyenId, photoUrl });
    res.status(201).json(signalement);
  } catch (error) {
    handleError(res, error);
  }
}

// READ - Lister tous les signalements (avec pagination et tri)
export async function lister(req: Request, res: Response) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const tri = (req.query.tri as string) || 'dateCreation';

    const signalements = await signalementService.listerSignalements(page, limit, tri);
    res.status(200).json(signalements);
  } catch (error) {
    handleError(res, error);
  }
}

// READ - Recuperer un signalement par son id
export async function getParId(req: Request, res: Response) {
  try {
    const signalement = await signalementService.getSignalementParId(req.params.id as string);
    res.status(200).json(signalement);
  } catch (error) {
    handleError(res, error);
  }
}

// UPDATE - Mettre a jour un signalement
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

// Action metier - Changer le statut
export async function changerStatut(req: Request, res: Response) {
  try {
    const { statut } = req.body;
    const signalement = await signalementService.changerStatutSignalement(req.params.id as string, statut);
    res.status(200).json(signalement);
  } catch (error) {
    handleError(res, error);
  }
}

// Action metier - Annuler un signalement
export async function annuler(req: Request, res: Response) {
  try {
    const resultat = await signalementService.annulerSignalement(req.params.id as string);
    res.status(200).json(resultat);
  } catch (error) {
    handleError(res, error);
  }
}

// READ - Consulter l'historique des statuts d'un signalement
export async function historique(req: Request, res: Response) {
  try {
    const liste = await signalementService.getHistorique(req.params.id as string);
    res.status(200).json(liste);
  } catch (error) {
    handleError(res, error);
  }
}

// READ - Consulter les notifications d'un citoyen
export async function notifications(req: Request, res: Response) {
  try {
    const liste = await signalementService.getNotificationsParCitoyen(req.params.citoyenId as string);
    res.status(200).json(liste);
  } catch (error) {
    handleError(res, error);
  }
}