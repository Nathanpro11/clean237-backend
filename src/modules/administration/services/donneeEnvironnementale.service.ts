import createHttpError from "http-errors";
import mongoose from "mongoose";

import DonneeModel from "../models/donneeEnvironnementale.model";
import { parsePaginationAndSort } from "../utils/pagination";

export const getDonnees = async (query: Record<string, unknown> = {}) => {
  const filter: Record<string, unknown> = {};

  if (query.zoneId) {
    const zoneId = String(query.zoneId);
    if (!mongoose.Types.ObjectId.isValid(zoneId)) {
      throw createHttpError(422, "Identifiant invalide");
    }
    filter.zoneId = new mongoose.Types.ObjectId(zoneId);
  }

  if (typeof query.type === "string" && query.type.trim() !== "") {
    filter.type = query.type.trim();
  } else if (query.type !== undefined && query.type !== null) {
    throw createHttpError(422, "Type invalide");
  }

  const { page, limit, skip, sortOptions } = parsePaginationAndSort(
    query as Record<string, string | number | boolean | undefined | null>,
    ["date", "createdAt"],
    "date"
  );

  const [data, total] = await Promise.all([
    DonneeModel.find(filter).sort(sortOptions).skip(skip).limit(limit),
    DonneeModel.countDocuments(filter),
  ]);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

export const getDonneeById = async (id: string) => {
  const donnee = await DonneeModel.findById(id);
  if (!donnee) {
    throw createHttpError(404, "Donnée environnementale introuvable");
  }
  return donnee;
};

