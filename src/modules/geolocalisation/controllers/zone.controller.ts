import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import zoneModel from "../models/zone.model.js";
import { zoneValidationSchema } from "../utils/validationSchema.js";

export const createZone = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const valideZone = await zoneValidationSchema.validateAsync(req.body);
    const zone = new zoneModel(valideZone);
    await zone.save();
    return res.status(201).json({ message: "Zone créée avec succès"});
  } catch (error: any) {
    if (error.isJoi) return next(createHttpError(422, error.details.message));
    next(error);
  }
}

export const getAllZones = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const zones = await zoneModel.find();
    return res.status(200).json(zones);
  } catch (error: any) {
    next(error);
  }
}

export const getZoneById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const zone = await zoneModel.findById(req.params.id);
    if (!zone) {
      throw createHttpError(404, "Zone non trouvée");
    }
    return res.status(200).json(zone);
  } catch (error: any) {
    next(error);
  }
}

export const updateZone = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const valideZone = await zoneValidationSchema.validateAsync(req.body);
    const zoneUpdated = await zoneModel.findByIdAndUpdate(req.params.id, valideZone);
    if (!zoneUpdated) {
      throw createHttpError(404, "Zone non trouvée");
    }
    return res.status(200).json({ message: "Zone mise à jour avec succès"});
  } catch (error: any) {
    if (error.isJoi) return next(createHttpError(422, error.details.message));
    next(error);
  }
}

export const deleteZone = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const zoneDeleted = await zoneModel.findByIdAndDelete(req.params.id);
    if (!zoneDeleted) {
      throw createHttpError(404, "Zone non trouvée");
    }
    return res.status(200).json({ message: "Zone supprimée avec succès" });
  } catch (error: any) {
    next(error);
  }
};