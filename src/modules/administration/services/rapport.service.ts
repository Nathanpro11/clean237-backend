import createHttpError from "http-errors";
import { PDFDocument } from "pdf-lib";

import analyseModel from "../models/analyse.model";
import rapportModel from "../models/rapport.model";
import { parsePaginationAndSort } from "../utils/pagination";
import { buildReportPdf } from "../pdf/reportPdf.service";

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const generateReportFromAnalyse = async (
  analyseId: string,
  customData?: {
    titre?: string;
    description?: string;
  }
) => {
  const analyse = await analyseModel.findById(analyseId);

  if (!analyse) {
    throw createHttpError(404, "Analyse introuvable");
  }

  const titre = customData?.titre?.trim() || `Rapport d'analyse - ${analyse.type}`;
  const description = customData?.description?.trim() || analyse.resultat || "Aucune description fournie.";

  const rapport = await rapportModel.create({
    titre,
    description,
    analyseId: analyse._id,
    statistiques: analyse.indicateurs || {},
  });

  return rapport.populate({ path: "analyseId", select: "-donneesUtilisees" });
};

export const getReports = async (queryParams: Record<string, unknown> = {}) => {
  const { page, limit, skip, sortOptions } = parsePaginationAndSort(
    queryParams as Record<string, string | number | boolean | undefined | null>,
    ["createdAt", "updatedAt", "titre"],
    "createdAt"
  );

  const filter: Record<string, unknown> = {};
  const search = typeof queryParams.search === "string" ? queryParams.search.trim() : "";

  if (search) {
    filter.titre = { $regex: new RegExp(escapeRegex(search), "i") };
  }

  const [reports, total] = await Promise.all([
    rapportModel.find(filter).populate({ path: "analyseId", select: "-donneesUtilisees" }).sort(sortOptions).skip(skip).limit(limit),
    rapportModel.countDocuments(filter),
  ]);

  return {
    data: reports,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

export const getReportById = async (id: string) => {
  const rapport = await rapportModel.findById(id).populate({ path: "analyseId", select: "-donneesUtilisees" });
  if (!rapport) {
    throw createHttpError(404, "Rapport introuvable");
  }
  return rapport;
};

export const deleteReport = async (id: string) => {
  const rapport = await rapportModel.findByIdAndDelete(id);
  if (!rapport) {
    throw createHttpError(404, "Rapport introuvable");
  }
  return rapport;
};

export const generateReportPDF = async (reportId: string) => {
  const rapport = await rapportModel.findById(reportId).populate({ path: "analyseId", select: "-donneesUtilisees" });

  if (!rapport) {
    throw createHttpError(404, "Rapport introuvable");
  }

  const pdfDoc = await PDFDocument.create();
  const pdfBytes = await buildReportPdf(pdfDoc, rapport);

  return {
    pdfBytes,
    filename: `rapport-${rapport._id}.pdf`,
  };
};