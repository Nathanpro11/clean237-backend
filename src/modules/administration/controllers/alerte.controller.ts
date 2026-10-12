import type { NextFunction, Request, Response } from "express";

import {
  getAlertes,
  getAlerteById,
  traiterAlerte,
} from "../services/alerte.service";
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
    res.status(200).json({ message: "Alerte traitée avec succès", alerte });
  } catch (error: unknown) {
    next(error);
  }
};
