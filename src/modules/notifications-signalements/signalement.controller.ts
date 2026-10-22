import type { NextFunction, Request, Response } from "express";
import * as service from "./signalement.service";

const utilisateur = (req: Request) => (req as any).user;
const id = (req: Request) => req.params.id as string;

const gerer =
  (fn: (req: Request, res: Response) => Promise<unknown>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res);
    } catch (error) {
      next(error);
    }
  };

export const creer = gerer(async (req, res) => {
  const { description, photoUrl, quartier, precision } = req.body ?? {};
  res.status(201).json(await service.creerSignalement(utilisateur(req), { description, photoUrl, quartier, precision, latitude: req.body?.latitude, longitude: req.body?.longitude }));
});
export const lister = gerer(async (req, res) => { res.status(200).json(await service.listerTous(req.query)); });
export const mesSignalements = gerer(async (req, res) => { res.status(200).json(await service.mesSignalements(utilisateur(req), req.query)); });
export const mesStatistiques = gerer(async (req, res) => { res.status(200).json(await service.mesStatistiques(utilisateur(req))); });
export const aTraiter = gerer(async (req, res) => { res.status(200).json(await service.aTraiter(utilisateur(req), req.query)); });
export const historiqueAgent = gerer(async (req, res) => { res.status(200).json(await service.historiqueAgent(utilisateur(req), req.query)); });
export const getParId = gerer(async (req, res) => { res.status(200).json(await service.getParId(utilisateur(req), id(req))); });
export const mettreAJour = gerer(async (req, res) => {
  const { description, quartier, precision, photoUrl } = req.body ?? {};
  res.status(200).json(await service.mettreAJour(utilisateur(req), id(req), { description, quartier, precision, photoUrl }));
});
export const annuler = gerer(async (req, res) => { res.status(200).json(await service.annuler(utilisateur(req), id(req))); });
export const changerStatut = gerer(async (req, res) => {
  const { statut, motifRejet } = req.body ?? {};
  res.status(200).json(await service.changerStatut(utilisateur(req), id(req), statut, motifRejet));
});
export const archiver = gerer(async (req, res) => { res.status(200).json(await service.archiver(utilisateur(req), id(req))); });
export const supprimer = gerer(async (req, res) => { await service.supprimer(id(req)); res.status(204).send(); });

export const listerNotifications = gerer(async (req, res) => { res.status(200).json(await service.listerNotifications(utilisateur(req), req.query)); });
export const marquerLue = gerer(async (req, res) => { res.status(200).json(await service.marquerLue(utilisateur(req), id(req))); });
export const supprimerNotification = gerer(async (req, res) => { await service.supprimerNotification(utilisateur(req), id(req)); res.status(204).send(); });
export const marquerToutesLues = gerer(async (req, res) => { res.status(200).json(await service.marquerToutesLues(utilisateur(req))); });
