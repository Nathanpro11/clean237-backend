import createHttpError from "http-errors";
import mongoose from "mongoose";

import DonneeModel from "../models/donneeEnvironnementale.model";
import ZoneModel from "../models/zone.model";
import { parsePaginationAndSort } from "../utils/pagination";

const mapSeverityFromLevel = (niveau: "critique" | "problématique" | "à surveiller" | "normal"): "critique" | "avertissement" | "info" => {
  if (niveau === "critique") return "critique";
  if (niveau === "problématique" || niveau === "à surveiller") return "avertissement";
  return "info";
};

const getZoneLevel = (score: number): "critique" | "problématique" | "à surveiller" | "normal" => {
  if (score >= 80) return "critique";
  if (score >= 60) return "problématique";
  if (score >= 40) return "à surveiller";
  return "normal";
};

export const getZoneAlertSummary = async (zoneId: string | mongoose.Types.ObjectId) => {
  const objectId = typeof zoneId === "string" ? new mongoose.Types.ObjectId(zoneId) : zoneId;
  const alertesActives = await DonneeModel.countDocuments({
    zoneId: objectId,
    type: "alerte",
    statut: "active",
  });
  const score = Math.min(alertesActives * 10, 100);
  const niveau = getZoneLevel(score);

  return {
    score,
    niveau,
    alertesActives,
  };
};

const serializeAlerte = async (donnee: any) => {
  const zone = await ZoneModel.findById(donnee.zoneId, { nom: 1 }).lean();
  const summary = await getZoneAlertSummary(donnee.zoneId);
  const severite = mapSeverityFromLevel(summary.niveau);
  const titre = donnee.description?.trim() ? donnee.description.trim() : `Alerte · ${zone?.nom ?? "Zone inconnue"}`;
  const sousTitre = donnee.source?.trim() || "Signalement";

  return {
    _id: donnee._id,
    titre,
    sousTitre,
    zoneId: donnee.zoneId,
    zoneNom: zone?.nom ?? "Zone inconnue",
    date: donnee.date ? new Date(donnee.date).toISOString() : null,
    severite,
    statut: donnee.statut ?? "active",
  };
};

export const getAlertes = async (queryParams: Record<string, unknown> = {}) => {
  const { page, limit, skip, sortOptions } = parsePaginationAndSort(
    queryParams as Record<string, string | number | boolean | undefined | null>,
    ["date", "createdAt"],
    "date"
  );

  const filter: Record<string, unknown> = {
    type: "alerte",
  };

  if (queryParams.zoneId) {
    const zoneId = String(queryParams.zoneId);
    if (!mongoose.Types.ObjectId.isValid(zoneId)) {
      throw createHttpError(422, "Identifiant invalide");
    }
    filter.zoneId = new mongoose.Types.ObjectId(zoneId);
  }

  if (queryParams.statut) {
    const statut = String(queryParams.statut);
    if (statut !== "active" && statut !== "traitee") {
      throw createHttpError(422, "Le statut est invalide.");
    }
    filter.statut = statut;
  }

  if (typeof queryParams.search === "string" && queryParams.search.trim()) {
    filter.$or = [
      { description: { $regex: new RegExp(queryParams.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") } },
      { source: { $regex: new RegExp(queryParams.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") } },
    ];
  }

  const alerts = await DonneeModel.find(filter).sort(sortOptions);
  const serialized = await Promise.all(alerts.map((alert) => serializeAlerte(alert.toObject ? alert.toObject() : alert)));

  const filteredBySeverity = typeof queryParams.severite === "string"
    ? serialized.filter((alert) => alert.severite === queryParams.severite)
    : serialized;

  const paginated = filteredBySeverity.slice(skip, skip + limit);

  return {
    data: paginated,
    pagination: {
      page,
      limit,
      total: filteredBySeverity.length,
      totalPages: Math.max(1, Math.ceil(filteredBySeverity.length / limit)),
    },
  };
};

export const getAlerteById = async (id: string) => {
  const alerte = await DonneeModel.findById(id);
  if (!alerte || alerte.type !== "alerte") {
    throw createHttpError(404, "Alerte introuvable");
  }

  return serializeAlerte(alerte.toObject ? alerte.toObject() : alerte);
};

export const traiterAlerte = async (id: string) => {
  const alerte = await DonneeModel.findById(id);
  if (!alerte || alerte.type !== "alerte") {
    throw createHttpError(404, "Alerte introuvable");
  }

  alerte.statut = "traitee";
  await alerte.save();

  return serializeAlerte(alerte.toObject ? alerte.toObject() : alerte);
};
