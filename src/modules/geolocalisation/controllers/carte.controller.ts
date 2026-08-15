import { Request, Response, NextFunction } from "express";
import bacAOrdureModel from "../models/bacAOrdure.model.js";
import zoneModel from "../models/zone.model.js";

export const getCarteData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bacs = await bacAOrdureModel.find().populate("zone");
    const zones = await zoneModel.find();

    return res.status(200).json({ message: "Données de la carte récupérées avec succès", zones, bacs});
  } catch (error: any) {
    next(error);
  }
};