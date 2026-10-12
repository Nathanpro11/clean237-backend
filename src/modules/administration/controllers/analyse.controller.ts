import type { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";

import { deleteAnalyse, generateAnalyse, getAnalyseById, getAnalyses } from "../services/analyse.service";
import { analyseValidation, idValidation } from "../utils/validationSchemas";

export const generateAnalyseController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validated = await analyseValidation.validateAsync(req.body);
    if (validated.periode && new Date(validated.periode.end).getTime() < new Date(validated.periode.start).getTime()) {
      throw createHttpError(422, "La date de fin doit être supérieure ou égale à la date de début.");
    }
    const analyse = await generateAnalyse(validated);
    res.status(201).json({ message: "Analyse générée avec succès", analyse });
  } catch (error: unknown) {
    next(error);
  }
};

export const getAnalysesController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await getAnalyses(req.query as Record<string, unknown>);
    res.status(200).json({ message: "Analyses récupérées avec succès", data: result.data, pagination: result.pagination });
  } catch (error: unknown) {
    next(error);
  }
};

export const getAnalyseByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = await idValidation.validateAsync(req.params);
    const analyse = await getAnalyseById(id);
    res.status(200).json({ message: "Analyse récupérée avec succès", analyse });
  } catch (error: unknown) {
    next(error);
  }
};

export const deleteAnalyseController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = await idValidation.validateAsync(req.params);
    await deleteAnalyse(id);
    res.status(200).json({ message: "Analyse supprimée avec succès" });
  } catch (error: unknown) {
    next(error);
  }
};

