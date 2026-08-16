import type { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";

import zoneModel from "../models/zone.model";
import { idValidation, zoneValidation} from "../utils/validationSchemas";
import { getZoneStatistics, getZoneAlerts } from "../services/zone.service";



// GET ALL ZONES
export const getZones = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const zones = await zoneModel.find();

        return res.status(200).json({
            message: "Zones récupérées avec succès",
            zones
        });

    } catch (error: any) {
        return next(error);
    }
};


// GET ZONE BY ID
export const getZoneById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        const zone = await zoneModel.findById(id);

        if (!zone) {
            return next(
                createHttpError(404, "Zone introuvable")
            );
        }

        return res.status(200).json({
            message: "Zone récupérée avec succès",
            zone
        });

    } catch (error: any) {
        return next(error);
    }
};


// GET ZONE STATISTICS
export const getZoneStatisticsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = await idValidation.validateAsync(req.params);

    const statistics = await getZoneStatistics(id);

    return res.status(200).json({
      message: "Statistiques de la zone récupérées avec succès",
      statistics,
    });
  } catch (error: unknown) {
    const err = error as any;
    if (err.isJoi) {
      return next(
        createHttpError(
          422,
          err.details
            .map((e: any) => e.message)
            .join(", ")
        )
      );
    }

    return next(error);
  }
};

// GET ZONE ALERTS
export const getZoneAlertsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = await idValidation.validateAsync(req.params);

    const alerts = await getZoneAlerts(id);

    return res.status(200).json({
      message: "Alertes de la zone récupérées avec succès",
      alerts,
    });
  } catch (error: unknown) {
    const err = error as any;
    if (err.isJoi) {
      return next(
        createHttpError(
          422,
          err.details
            .map((e: any) => e.message)
            .join(", ")
        )
      );
    }

    return next(error);
  }
};