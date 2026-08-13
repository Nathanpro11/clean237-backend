import type { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import Joi from "joi";

import {
  idValidation,
  reportValidation,
  reportUpdateValidation,
} from "../utils/validationSchemas";
import {
  createReport,
  getReports,
  getReportById,
  updateReport,
  deleteReport,
  generateReportData,
} from "../services/rapport.service";

export const createReportController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedReport = await reportValidation.validateAsync(req.body);
    const report = await createReport(validatedReport);

    return res.status(201).json({
      message: "Rapport créé avec succès",
      report,
    });
  } catch (error: unknown) {
    const err = error as any;
    if (err.isJoi) {
      return next(
        createHttpError(
          422,
          err.details.map((e: any) => e.message).join(", ")
        )
      );
    }
    return next(error);
  }
};

export const getReportsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const reports = await getReports();
    return res.status(200).json({
      message: "Rapports récupérés avec succès",
      reports,
    });
  } catch (error: unknown) {
    return next(error);
  }
};

export const getReportByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = await idValidation.validateAsync(req.params);
    const report = await getReportById(id);

    return res.status(200).json({
      message: "Rapport récupéré avec succès",
      report,
    });
  } catch (error: unknown) {
    const err = error as any;
    if (err.isJoi) {
      return next(
        createHttpError(
          422,
          err.details.map((e: any) => e.message).join(", ")
        )
      );
    }
    return next(error);
  }
};

export const updateReportController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = await idValidation.validateAsync(req.params);
    const validatedReport = await reportUpdateValidation.validateAsync(req.body);
    const report = await updateReport(id, validatedReport);

    return res.status(200).json({
      message: "Rapport modifié avec succès",
      report,
    });
  } catch (error: unknown) {
    const err = error as any;
    if (err.isJoi) {
      return next(
        createHttpError(
          422,
          err.details.map((e: any) => e.message).join(", ")
        )
      );
    }
    return next(error);
  }
};

export const deleteReportController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = await idValidation.validateAsync(req.params);
    await deleteReport(id);

    return res.status(200).json({
      message: "Rapport supprimé avec succès",
    });
  } catch (error: unknown) {
    const err = error as any;
    if (err.isJoi) {
      return next(
        createHttpError(
          422,
          err.details.map((e: any) => e.message).join(", ")
        )
      );
    }
    return next(error);
  }
};

export const generateReportController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const schema = Joi.object({
      zoneId: Joi.string().required().messages({
        "string.empty": "L'identifiant de la zone est requis.",
        "any.required": "L'identifiant de la zone est requis.",
      }),
    });

    const { zoneId } = await schema.validateAsync(req.params);
    const generatedReport = await generateReportData(zoneId);

    return res.status(200).json({
      message: "Données du rapport générées avec succès",
      report: generatedReport,
    });
  } catch (error: unknown) {
    const err = error as any;
    if (err.isJoi) {
      return next(
        createHttpError(
          422,
          err.details.map((e: any) => e.message).join(", ")
        )
      );
    }
    return next(error);
  }
};
