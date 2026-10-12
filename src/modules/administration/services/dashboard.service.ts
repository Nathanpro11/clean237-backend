import AnalyseModel from "../models/analyse.model";
import DonneeModel from "../models/donneeEnvironnementale.model";
import RapportModel from "../models/rapport.model";
import ZoneModel from "../models/zone.model";

export const getDashboardStatistics = async () => {
  const [donnees, analyses, rapports, totalZones] = await Promise.all([
    DonneeModel.find(),
    AnalyseModel.find(),
    RapportModel.find(),
    ZoneModel.countDocuments(),
  ]);

  const totalDataPoints = donnees.length;
  const dataByType: Record<string, number> = {};

  for (const donnee of donnees) {
    const key = donnee.type || "inconnu";
    dataByType[key] = (dataByType[key] ?? 0) + 1;
  }

  const totalAnalyses = analyses.length;
  const analysesWithResult = analyses.filter((analyse) => {
    const result = analyse.resultat ?? "";
    return typeof result === "string" && result.trim().length > 0;
  }).length;

  const totalReports = rapports.length;
  const reportsWithStats = rapports.filter((rapport) => {
    if (!rapport.statistiques || typeof rapport.statistiques !== "object") {
      return false;
    }
    return Object.keys(rapport.statistiques).length > 0;
  }).length;

  const problematicZones = await DonneeModel.aggregate([
    { $match: { type: "alerte" } },
    { $group: { _id: "$zoneId", alertCount: { $sum: 1 } } },
  ]);

  const zonesCritiques = problematicZones.filter((zone) => zone.alertCount >= 8).length;

  return {
    totalZones,
    totalDataPoints,
    dataByType,
    totalAnalyses,
    analysesWithResult,
    totalReports,
    reportsWithStats,
    zonesCritiques,
  };
};


