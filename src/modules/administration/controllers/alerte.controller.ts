import type { NextFunction, Request, Response } from "express";

import {
  getAlertes,
  getAlerteById,
  traiterAlerte,
} from "../services/alerte.service";
import { resoudreDepuisAlerte } from "../../notifications-signalements/signalement.service";
import { getAlertesQueryValidation, idValidation } from "../utils/validationSchemas";

export const getAlertesController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validatedQuery = await getAlertesQueryValidation.validateAsync(req.query, { abortEarly: false });
    const result = await getAlertes(validatedQuery as Record<string, unknown>);
    res.status(200).json({ message: "Alertes récupérées avec succès", data: result.data, pagination: result.pagination });
  } catch (error: unknown) {
    next(error);
  }
};

export const getAlerteByIdController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = await idValidation.validateAsync(req.params);
    const alerte = await getAlerteById(id);
    res.status(200).json({ message: "Alerte récupérée avec succès", alerte });
  } catch (error: unknown) {
    next(error);
  }
};

export const traiterAlerteController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = await idValidation.validateAsync(req.params);
    const alerte = await traiterAlerte(id);

    // Signalement lié : résolu, citoyen prévenu. Une erreur ici ne bloque jamais le traitement de l'alerte.
    try {
      await resoudreDepuisAlerte((req as any).user, id);
    } catch (error: unknown) {
      console.error("Signalement lié à l'alerte :", error instanceof Error ? error.message : error);
    }

    res.status(200).json({ message: "Alerte traitée avec succès", alerte });
  } catch (error: unknown) {
    next(error);
  }
};
