import createHttpError from "http-errors";
import { Types } from "mongoose";
import { PDFDocument } from "pdf-lib";

import AnalyseModel from "../models/analyse.model";
import DonneeModel from "../models/donneeEnvironnementale.model";
import rapportModel from "../models/rapport.model";
import Utilisateur from "../../utilisateurs/models/utilisateur.model";
import { parsePaginationAndSort } from "../utils/pagination";
import { buildReportPdf } from "../pdf/reportPdf.service";

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Nom du compte (module utilisateurs) qui a généré le rapport
const getAuteurNom = async (generePar: unknown): Promise<string> => {
  if (!generePar) return "Non renseigné";
  const auteur: any = await Utilisateur.findById(generePar as any).select("nom").lean();
  return auteur?.nom || "Compte supprimé";
};

const normalizeZones = async (analyse: any, explicitZones?: Array<{ _id: string; nom: string }>) => {
  if (Array.isArray(explicitZones) && explicitZones.length > 0) {
    return explicitZones.map((zone) => ({ _id: zone._id, nom: zone.nom }));
  }

  if (analyse?.zoneId) {
    return [{ _id: analyse.zoneId, nom: analyse.zoneNom || "Zone inconnue" }];
  }

  const zoneIds = await DonneeModel.distinct("zoneId", { _id: { $in: analyse?.donneesUtilisees ?? [] } });
  return zoneIds.map((zoneId: any) => ({ _id: String(zoneId), nom: "Zone incluse" }));
};

export const generateReportFromAnalyse = async (
  analyseId: string,
  customData?: {
    titre?: string;
    description?: string;
    type?: "synthese" | "suivi" | "export";
    statut?: "pret" | "en_cours" | "archive";
    format?: "pdf" | "csv";
    zones?: Array<{ _id: string; nom: string }>;
  },
  auteurId?: string
) => {
  const analyse = await AnalyseModel.findById(analyseId);

  if (!analyse) {
    throw createHttpError(404, "Analyse introuvable");
  }

  const titre = customData?.titre?.trim() || `Rapport d'analyse - ${analyse.type}`;
  const description = customData?.description?.trim() || analyse.resultat || "Aucune description fournie.";
  const zones = await normalizeZones(analyse, customData?.zones);

  const rapport = await rapportModel.create({
    titre,
    description,
    type: customData?.type ?? "synthese",
    statut: customData?.statut ?? "pret",
    format: customData?.format ?? "pdf",
    analyseId: analyse._id,
    statistiques: analyse.indicateurs || {},
    zones,
    // Liaison avec le module utilisateurs : compte qui a généré le rapport
    generePar: auteurId && Types.ObjectId.isValid(auteurId) ? new Types.ObjectId(auteurId) : undefined,
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

  if (typeof queryParams.statut === "string") {
    filter.statut = queryParams.statut;
  }

  if (typeof queryParams.type === "string") {
    filter.type = queryParams.type;
  }

  if (typeof queryParams.zoneId === "string" && queryParams.zoneId.trim()) {
    filter.zones = { $elemMatch: { _id: queryParams.zoneId } };
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

export const updateReportStatus = async (id: string, statut: "pret" | "en_cours" | "archive") => {
  const rapport = await rapportModel.findById(id);
  if (!rapport) {
    throw createHttpError(404, "Rapport introuvable");
  }

  rapport.statut = statut;
  await rapport.save();
  return rapport.populate({ path: "analyseId", select: "-donneesUtilisees" });
};

export const generateReportPDF = async (reportId: string) => {
  const rapport = await rapportModel.findById(reportId).populate({ path: "analyseId", select: "-donneesUtilisees" });

  if (!rapport) {
    throw createHttpError(404, "Rapport introuvable");
  }

  const auteurNom = await getAuteurNom((rapport as any).generePar);

  const pdfDoc = await PDFDocument.create();
  const pdfBytes = await buildReportPdf(pdfDoc, rapport, auteurNom);

  return {
    pdfBytes,
    filename: `rapport-${rapport._id}.pdf`,
  };
};

export const exportReportCSV = async (reportId: string) => {
  const rapport = await rapportModel.findById(reportId).populate({ path: "analyseId", select: "-donneesUtilisees" });
  if (!rapport) {
    throw createHttpError(404, "Rapport introuvable");
  }

  const summary = rapport.statistiques && typeof rapport.statistiques === "object" ? (rapport.statistiques as Record<string, any>) : {};
  const rows = summary.parType && typeof summary.parType === "object" ? summary.parType : {};

  const lines: string[] = [
    "\uFEFFRapport;" + String(rapport.titre ?? "").replace(/;/g, ","),
    "Type;Nb points;Moyenne;Minimum;Maximum;Unité",
  ];

  Object.entries(rows).forEach(([type, values]) => {
    const metric = values as Record<string, unknown>;
    const moyenne = Number(metric.moyenne ?? 0);
    const minimum = Number(metric.minimum ?? 0);
    const maximum = Number(metric.maximum ?? 0);
    const unite = (metric.unite ?? "") as string;

    lines.push([
      String(type),
      String(metric.count ?? 0),
      moyenne.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 2 }),
      minimum.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 2 }),
      maximum.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 2 }),
      String(unite || ""),
    ].join(";"));
  });

  const content = lines.join("\n");
  return {
    filename: `rapport-${rapport._id}.csv`,
    content,
  };
};