import type { Request, Response, NextFunction } from "express";

import { getDonneeById, getDonnees } from "../services/donneeEnvironnementale.service";
import { idValidation } from "../utils/validationSchemas";

export const getDonneesController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await getDonnees(req.query as Record<string, unknown>);
    res.status(200).json({ message: "Données environnementales récupérées avec succès", data: result.data, pagination: result.pagination });
  } catch (error: unknown) {
    next(error);
  }
};

export const getDonneeByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = await idValidation.validateAsync(req.params);
    const donnee = await getDonneeById(id);
    res.status(200).json({ message: "Donnée environnementale récupérée avec succès", donnee });
  } catch (error: unknown) {
    next(error);
  }
};

