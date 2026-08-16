import zoneModel from "../models/zone.model";
import {
  mockAlerts,
  mockCollections,
} from "../mocks/administration.mocks";

export const getDashboardStatistics = async () => {
  const zones = await zoneModel.find();
  const totalZones = zones.length;
  const activeZones = zones.filter((z) => z.etat === "actif").length;

  const totalAlerts = mockAlerts.length;
  const activeAlerts = mockAlerts.filter(
    (alert) => alert.status === "active"
  ).length;
  const resolvedAlerts = mockAlerts.filter(
    (alert) => alert.status === "resolved"
  ).length;

  const totalCollections = mockCollections.length;
  const completedCollections = mockCollections.filter(
    (collection) => collection.status === "completed"
  ).length;
  const pendingCollections = mockCollections.filter(
    (collection) => collection.status === "pending"
  ).length;

  return {
    totalZones,
    activeZones,
    totalAlerts,
    activeAlerts,
    resolvedAlerts,
    totalCollections,
    completedCollections,
    pendingCollections,
  };
};
