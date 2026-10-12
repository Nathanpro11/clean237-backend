import type { Request, Response, NextFunction } from "express";

import { getZoneById, getZoneDetails, getZones } from "../services/zone.service";
import { idValidation } from "../utils/validationSchemas";

export const getZonesController = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const zones = await getZones();
    res.status(200).json({ message: "Zones récupérées avec succès", zones });
  } catch (error: unknown) {
    next(error);
  }
};

export const getZoneByIdController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = await idValidation.validateAsync(req.params);
    const zone = await getZoneById(id);
    res.status(200).json({ message: "Zone récupérée avec succès", zone });
  } catch (error: unknown) {
    next(error);
  }
};

export const getZoneDetailsController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = await idValidation.validateAsync(req.params);
    const zone = await getZoneDetails(id);
    res.status(200).json({ message: "Détails de la zone récupérés avec succès", zone });
  } catch (error: unknown) {
    next(error);
  }
};
