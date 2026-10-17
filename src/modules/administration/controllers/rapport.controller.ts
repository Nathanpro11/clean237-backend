import type { Request, Response, NextFunction } from "express";

import {
  deleteReport,
  exportReportCSV,
  generateReportFromAnalyse,
  generateReportPDF,
  getReportById,
  getReports,
  updateReportStatus,
} from "../services/rapport.service";
import { exportFormatValidation, idValidation, reportStatusValidation, reportValidation } from "../utils/validationSchemas";

export const generateReportController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validated = await reportValidation.validateAsync(req.body);
    // (req as any).user est renseigné par authenticate (module utilisateurs)
    const report = await generateReportFromAnalyse(
      validated.analyseId,
      {
        titre: validated.titre,
        description: validated.description,
        type: validated.type,
        format: validated.format,
        statut: validated.statut,
        zones: validated.zones,
      },
      String((req as any).user._id)
    );

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

export const updateReportStatusController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = await idValidation.validateAsync(req.params);
    const { statut } = await reportStatusValidation.validateAsync(req.body);
    const report = await updateReportStatus(id, statut);
    res.status(200).json({ message: "Statut du rapport mis à jour avec succès", report });
  } catch (error: unknown) {
    next(error);
  }
};

export const getReportExportController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = await idValidation.validateAsync(req.params);
    const { format } = await exportFormatValidation.validateAsync(req.query);

    if (format === "pdf") {
      const { pdfBytes, filename } = await generateReportPDF(id);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.status(200).send(Buffer.from(pdfBytes));
      return;
    }

    const { filename, content } = await exportReportCSV(id);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.status(200).send(content);
  } catch (error: unknown) {
    next(error);
  }
};