import createHttpError from "http-errors";
import rapportModel from "../models/rapport.model";
import zoneModel from "../models/zone.model";
import { getZoneStatistics } from "./zone.service";

export const generateReportData = async (zoneId: string) => {
  const { zone, statistics } = await getZoneStatistics(zoneId);

  return {
    titre: `Rapport pour la zone ${zone.nom} (${zone.quartier})`,
    description: `Rapport automatique généré pour la zone ${zone.nom}.`,
    zoneId: zone._id,
    statistiques: {
      totalAlerts: statistics.totalAlerts,
      activeAlerts: statistics.activeAlerts,
      resolvedAlerts: statistics.resolvedAlerts,
      totalCollections: statistics.totalCollections,
      completedCollections: statistics.completedCollections,
      pendingCollections: statistics.pendingCollections,
    },
  };
};

export const createReport = async (data: any) => {
  const zone = await zoneModel.findById(data.zoneId);
  if (!zone) {
    throw createHttpError(404, "Zone introuvable");
  }

  const rapport = new rapportModel(data);
  await rapport.save();
  return rapport;
};

export const getReports = async () => {
  return rapportModel.find().populate("zoneId");
};

export const getReportById = async (id: string) => {
  const rapport = await rapportModel.findById(id).populate("zoneId");
  if (!rapport) {
    throw createHttpError(404, "Rapport introuvable");
  }
  return rapport;
};

export const updateReport = async (id: string, data: any) => {
  if (data.zoneId) {
    const zone = await zoneModel.findById(data.zoneId);
    if (!zone) {
      throw createHttpError(404, "Zone introuvable");
    }
  }

  const rapport = await rapportModel.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

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
