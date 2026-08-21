import type { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";

import {
  generateAnalyse,
  getAnalyses,
  getAnalyseById,
  deleteAnalyse,
} from "../services/analyse.service";

import {
  analyseValidation,
  idValidation,
} from "../utils/validationSchemas";

export const generateAnalyseController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validated = await analyseValidation.validateAsync(req.body);
    const analyse = await generateAnalyse(validated);
    return res.status(201).json({ message: "Analyse générée avec succès", analyse });
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

export const getAnalysesController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await getAnalyses(req.query);
    return res.status(200).json({ message: "Analyses récupérées avec succès", ...result });
  } catch (error: unknown) {
    return next(error);
  }
};

export const getAnalyseByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = await idValidation.validateAsync(req.params);
    const analyse = await getAnalyseById(id);
    return res.status(200).json({ message: "Analyse récupérée avec succès", analyse });
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

export const deleteAnalyseController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = await idValidation.validateAsync(req.params);
    await deleteAnalyse(id);
    return res.status(200).json({ message: "Analyse supprimée avec succès" });
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

