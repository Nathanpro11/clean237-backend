import type { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";

import {
  idValidation,
  reportValidation,
} from "../utils/validationSchemas";

import {
  generateReportFromAnalyse,
  getReports,
  getReportById,
  deleteReport,
  generateReportPDF,
} from "../services/rapport.service";

export const generateReportController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validated = await reportValidation.validateAsync(req.body);

    const report = await generateReportFromAnalyse(validated.analyseId, {
      titre: validated.titre,
      description: validated.description,
    });

    return res.status(201).json({
      message: "Rapport généré avec succès",
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
    const result = await getReports(req.query);

    return res.status(200).json({
      message: "Rapports récupérés avec succès",
      ...result,
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

export const getReportPDFController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = await idValidation.validateAsync(req.params);

    const { pdfBytes, filename } = await generateReportPDF(id);

    res.setHeader("Content-Type", "application/pdf");

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );

    return res.status(200).send(Buffer.from(pdfBytes));
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