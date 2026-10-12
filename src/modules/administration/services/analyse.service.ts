import createHttpError from "http-errors";
import mongoose from "mongoose";

import AnalyseModel from "../models/analyse.model";
import DonneeModel from "../models/donneeEnvironnementale.model";
import rapportModel from "../models/rapport.model";
import { parsePaginationAndSort } from "../utils/pagination";

export const generateAnalyse = async (data: { type?: string; periode?: { start: Date | string; end: Date | string } }) => {
  const analyseType = data.type || "global_environment_analysis";

  const query: Record<string, unknown> = {};
  if (data.periode) {
    const start = new Date(data.periode.start);
    const end = new Date(data.periode.end);
    query.date = { $gte: start, $lte: end };
  }

  const donnees = await DonneeModel.find(query);

  if (donnees.length === 0) {
    throw createHttpError(404, "Aucune donnée environnementale sur la période demandée");
  }

  const groupedByType = new Map<string, { count: number; sum: number; min: number; max: number; unite?: string; values: number[] }>();

  for (const donnee of donnees) {
    const key = String(donnee.type || "inconnu");
    const current: { count: number; sum: number; min: number; max: number; unite?: string; values: number[] } = groupedByType.get(key) ?? {
      count: 0,
      sum: 0,
      min: Number.POSITIVE_INFINITY,
      max: Number.NEGATIVE_INFINITY,
      unite: donnee.unite ?? undefined,
      values: [],
    };

    current.count += 1;
    current.sum += Number(donnee.valeur) || 0;
    current.min = Math.min(current.min, Number(donnee.valeur) || 0);
    current.max = Math.max(current.max, Number(donnee.valeur) || 0);
    current.values.push(Number(donnee.valeur) || 0);
    if (donnee.unite) {
      current.unite = donnee.unite;
    }

    groupedByType.set(key, current);
  }

  const parType: Record<string, { count: number; moyenne: number; minimum: number; maximum: number; somme: number; unite?: string }> = {};

  for (const [type, values] of groupedByType.entries()) {
    const moyenne = values.sum / values.count;
    parType[type] = {
      count: values.count,
      moyenne: Number(moyenne.toFixed(2)),
      minimum: Number(values.min.toFixed(2)),
      maximum: Number(values.max.toFixed(2)),
      somme: Number(values.sum.toFixed(2)),
      unite: values.unite,
    };
  }

  const totalPoints = donnees.length;
  const startDate = new Date(Math.min(...donnees.map((donnee) => new Date(donnee.date).getTime())));
  const endDate = new Date(Math.max(...donnees.map((donnee) => new Date(donnee.date).getTime())));

  const resultat = `Analyse de ${totalPoints} points de données sur la période du ${startDate.toLocaleDateString("fr-FR")} au ${endDate.toLocaleDateString("fr-FR")}.`;

  const analyse = await AnalyseModel.create({
    type: analyseType,
    periode: {
      start: startDate,
      end: endDate,
    },
    resultat,
    indicateurs: {
      totalPoints,
      parType,
    },
    donneesUtilisees: donnees.map((donnee) => donnee._id),
  });

  return analyse;
};

export const getAnalyses = async (queryParams: Record<string, unknown> = {}) => {
  const { page, limit, skip, sortOptions } = parsePaginationAndSort(
    queryParams as Record<string, string | number | boolean | undefined | null>,
    ["createdAt", "updatedAt", "type"],
    "createdAt"
  );

  const [analyses, total] = await Promise.all([
    AnalyseModel.find().sort(sortOptions).skip(skip).limit(limit),
    AnalyseModel.countDocuments(),
  ]);

  return {
    data: analyses,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

export const getAnalyseById = async (id: string) => {
  const analyse = await AnalyseModel.findById(id);
  if (!analyse) {
    throw createHttpError(404, "Analyse introuvable");
  }
  return analyse;
};

export const deleteAnalyse = async (id: string) => {
  const dependentRapport = await rapportModel.findOne({ analyseId: id });
  if (dependentRapport) {
    throw createHttpError(409, "Impossible de supprimer une analyse liée à un rapport");
  }

  const analyse = await AnalyseModel.findByIdAndDelete(id);
  if (!analyse) {
    throw createHttpError(404, "Analyse introuvable");
  }
  return analyse;
};

