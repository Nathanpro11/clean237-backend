import type { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";

import {
  getDonnees,
  getDonneeById,
} from "../services/donneeEnvironnementale.service";

import {
  idValidation,
} from "../utils/validationSchemas";

export const getDonneesController = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const donnees = await getDonnees();
    return res.status(200).json({ message: "Données récupérées", donnees });
  } catch (error: unknown) {
    return next(error);
  }
};

export const getDonneeByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = await idValidation.validateAsync(req.params);
    const donnee = await getDonneeById(id);
    return res.status(200).json({ message: "Donnée récupérée", donnee });
  } catch (error: unknown) {
    const err = error as any;
    if (err.isJoi) {
      return next(
        createHttpError(422, err.details.map((e: any) => e.message).join(", "))
      );
    }
    return next(error);
  }
};

