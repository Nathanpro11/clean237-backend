import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import localisationModel from "../models/localisation.model.js";
import { localisationValidationSchema } from "../utils/validationSchema.js";

export const getPositionActuelle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { latitude, longitude } = req.body;
    if (!latitude || !longitude) {
      throw createHttpError(400, "Les coordonnées GPS sont requises");
    }
    return res.status(200).json({message: "Position actuelle capturée avec succès"});
  } catch (error: any) {
    next(error);
  }
};

export const createLocalisation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const valideLocalisation = await localisationValidationSchema.validateAsync(req.body);
    const localisation = new localisationModel(valideLocalisation);
    await localisation.save();
    return res.status(201).json({ message: "Localisation enregistrée avec succès", localisation });
  } catch (error: any) {
    if (error.isJoi) return next(createHttpError(422, error.details.message));
    next(error);
  }
}

export const getHistoriquePositions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const localisations = await localisationModel.find().sort({ createdAt: -1 });
    return res.status(200).json(localisations);
  } catch (error: any) {
    next(error);
  }
}

export const deleteLocalisation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const localisationDeleted = await localisationModel.findByIdAndDelete(req.params.id);
    if (!localisationDeleted) {
      throw createHttpError(404, "Localisation non trouvée");
    }
    return res.status(200).json({ message: "Localisation supprimée avec succès" });
  } catch (error: any) {
    next(error);
  }
};