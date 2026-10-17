import { Request, Response } from 'express';
import * as signalementService from './signalement.service';
import { AppError } from './signalement.errors';

function handleError(res: Response, error: unknown) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ message: error.message });
  }
  console.error(error);
  return res.status(500).json({ message: 'Erreur interne du serveur' });
}

export async function creer(req: Request, res: Response) {
  try {
    const { description, citoyenId, photoUrl, quartier, precision } = req.body;
    const signalement = await signalementService.creerSignalement({ description, citoyenId, photoUrl, quartier, precision });
    res.status(201).json(signalement);
  } catch (error) { handleError(res, error); }
}

export async function lister(req: Request, res: Response) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const tri = (req.query.tri as string) || 'dateCreation';
    const signalements = await signalementService.listerSignalements(page, limit, tri);
    res.status(200).json(signalements);
  } catch (error) { handleError(res, error); }
}

export async function getParId(req: Request, res: Response) {
  try {
    const signalement = await signalementService.getSignalementParId(req.params.id as string);
    res.status(200).json(signalement);
  } catch (error) { handleError(res, error); }
}

export async function mettreAJour(req: Request, res: Response) {
  try {
    const { description, quartier, precision, photoUrl } = req.body;
    const signalement = await signalementService.mettreAJourSignalement(req.params.id as string, { description, quartier, precision, photoUrl });
    res.status(200).json(signalement);
  } catch (error) { handleError(res, error); }
}

export async function supprimer(req: Request, res: Response) {
  try {
    await signalementService.supprimerSignalement(req.params.id as string);
    res.status(204).send();
  } catch (error) { handleError(res, error); }
}

export async function changerStatut(req: Request, res: Response) {
  try {
    const { statut, motifRejet } = req.body;
    const signalement = await signalementService.changerStatutSignalement(req.params.id as string, statut, motifRejet);
    res.status(200).json(signalement);
  } catch (error) { handleError(res, error); }
}

export async function annuler(req: Request, res: Response) {
  try {
    const resultat = await signalementService.annulerSignalement(req.params.id as string);
    res.status(200).json(resultat);
  } catch (error) { handleError(res, error); }
}

export async function archiver(req: Request, res: Response) {
  try {
    const signalement = await signalementService.archiverSignalement(req.params.id as string);
    res.status(200).json(signalement);
  } catch (error) { handleError(res, error); }
}

export async function mesSignalements(req: Request, res: Response) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const liste = await signalementService.getSignalementsParCitoyen(req.params.citoyenId as string, page, limit);
    res.status(200).json(liste);
  } catch (error) { handleError(res, error); }
}

export async function statistiques(req: Request, res: Response) {
  try {
    const stats = await signalementService.getStatistiquesCitoyen(req.params.citoyenId as string);
    res.status(200).json(stats);
  } catch (error) { handleError(res, error); }
}

export async function aTraiter(req: Request, res: Response) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const liste = await signalementService.getSignalementsParAgent(req.params.agentId as string, page, limit);
    res.status(200).json(liste);
  } catch (error) { handleError(res, error); }
}

export async function historiqueAgent(req: Request, res: Response) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const liste = await signalementService.getHistoriqueAgent(req.params.agentId as string, page, limit);
    res.status(200).json(liste);
  } catch (error) { handleError(res, error); }
}

export async function listerNotificationsCtrl(req: Request, res: Response) {
  try {
    const destinataire = req.query.destinataire as string | undefined;
    const liste = await signalementService.listerNotifications(destinataire);
    res.status(200).json(liste);
  } catch (error) { handleError(res, error); }
}

export async function getNotificationCtrl(req: Request, res: Response) {
  try {
    const notification = await signalementService.getNotificationParId(req.params.id as string);
    res.status(200).json(notification);
  } catch (error) { handleError(res, error); }
}

export async function marquerLueCtrl(req: Request, res: Response) {
  try {
    const notification = await signalementService.marquerNotificationLue(req.params.id as string);
    res.status(200).json(notification);
  } catch (error) { handleError(res, error); }
}

export async function supprimerNotificationCtrl(req: Request, res: Response) {
  try {
    await signalementService.supprimerNotification(req.params.id as string);
    res.status(204).send();
  } catch (error) { handleError(res, error); }
}

export async function creerCitoyenTest(req: Request, res: Response) {
  try {
    const { nom, prenom, email, tel } = req.body;
    const citoyen = await signalementService.creerCitoyenTest({ nom, prenom, email, tel });
    res.status(201).json(citoyen);
  } catch (error) { handleError(res, error); }
}

export async function creerAgentTest(req: Request, res: Response) {
  try {
    const { matricule, zonesAffectees } = req.body;
    const agent = await signalementService.creerAgentTest({ matricule, zonesAffectees });
    res.status(201).json(agent);
  } catch (error) { handleError(res, error); }
}