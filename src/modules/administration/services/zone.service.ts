import createHttpError from "http-errors";
import zoneModel from "../models/zone.model";
import {
  mockAlerts,
  mockCollections,
} from "../mocks/administration.mocks";

export const getZoneAlerts = async (zoneId: string) => {
  const zone = await zoneModel.findById(zoneId);

  if (!zone) {
    throw createHttpError(404, "Zone introuvable");
  }

  return mockAlerts.filter(
    (alert) => alert.zoneId === zoneId
  );
};

export const getZoneCollections = async (zoneId: string) => {
  const zone = await zoneModel.findById(zoneId);

  if (!zone) {
    throw createHttpError(404, "Zone introuvable");
  }

  return mockCollections.filter(
    (collection) => collection.zoneId === zoneId
  );
};

export const getZoneStatistics = async (zoneId: string) => {
  const zone = await zoneModel.findById(zoneId);

  if (!zone) {
    throw createHttpError(404, "Zone introuvable");
  }

  const alerts = mockAlerts.filter(
    (alert) => alert.zoneId === zoneId
  );

  const collections = mockCollections.filter(
    (collection) => collection.zoneId === zoneId
  );

  const totalAlerts = alerts.length;

  const activeAlerts = alerts.filter(
    (alert) => alert.status === "active"
  ).length;

  const resolvedAlerts = alerts.filter(
    (alert) => alert.status === "resolved"
  ).length;

  const totalCollections = collections.length;

  const completedCollections = collections.filter(
    (collection) => collection.status === "completed"
  ).length;

  const pendingCollections = collections.filter(
    (collection) => collection.status === "pending"
  ).length;

  return {
    zone,
    statistics: {
      totalAlerts,
      activeAlerts,
      resolvedAlerts,
      totalCollections,
      completedCollections,
      pendingCollections,
    },
  };
};