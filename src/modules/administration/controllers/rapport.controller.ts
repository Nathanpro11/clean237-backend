import type { Request, Response, NextFunction } from "express";

import {
  deleteReport,
  generateReportFromAnalyse,
  generateReportPDF,
  getReportById,
  getReports,
} from "../services/rapport.service";
import { idValidation, reportValidation } from "../utils/validationSchemas";

export const generateReportController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validated = await reportValidation.validateAsync(req.body);
    const report = await generateReportFromAnalyse(validated.analyseId, {
      titre: validated.titre,
      description: validated.description,
    });

    res.status(201).json({ message: "Rapport généré avec succès", report });
  } catch (error: unknown) {
    next(error);
  }
};

export const getReportsController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await getReports(req.query as Record<string, unknown>);
    res.status(200).json({ message: "Rapports récupérés avec succès", data: result.data, pagination: result.pagination });
  } catch (error: unknown) {
    next(error);
  }
};

export const getReportByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = await idValidation.validateAsync(req.params);
    const report = await getReportById(id);
    res.status(200).json({ message: "Rapport récupéré avec succès", report });
  } catch (error: unknown) {
    next(error);
  }
};

export const deleteReportController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = await idValidation.validateAsync(req.params);
    await deleteReport(id);
    res.status(200).json({ message: "Rapport supprimé avec succès" });
  } catch (error: unknown) {
    next(error);
  }
};

export const getReportPDFController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = await idValidation.validateAsync(req.params);
    const { pdfBytes, filename } = await generateReportPDF(id);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.status(200).send(Buffer.from(pdfBytes));
  } catch (error: unknown) {
    next(error);
  }
};