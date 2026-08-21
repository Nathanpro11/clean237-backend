import AnalyseModel from "../models/analyse.model";
import DonneeModel from "../models/donneeEnvironnementale.model";
import RapportModel from "../models/rapport.model";

export const getDashboardStatistics = async () => {
  const [donnees, analyses, rapports] = await Promise.all([
    DonneeModel.find(),
    AnalyseModel.find(),
    RapportModel.find(),
  ]);

  const totalDataPoints = donnees.length;
  const dataByType: Record<string, number> = {};
  
  // Regroupement par zone (basé sur zoneId des données environnementales) et par type
  const zonesSet = new Set<string>();
  for (const donnee of donnees) {
    if (donnee.zoneId) {
      zonesSet.add(donnee.zoneId.toString());
    }
    const key = donnee.type || "inconnu";
    dataByType[key] = (dataByType[key] ?? 0) + 1;
  }

  const totalZones = zonesSet.size;

  const totalAnalyses = analyses.length;
  const analysesWithResult = analyses.filter((analyse) => {
    const result = analyse.resultat ?? "";
    return typeof result === "string" && result.trim().length > 0;
  }).length;

  const totalReports = rapports.length;
  const reportsWithStats = rapports.filter((rapport) =>
    rapport.statistiques && Object.keys(rapport.statistiques).length > 0
  ).length;

  return {
    totalZones,
    totalDataPoints,
    dataByType,
    totalAnalyses,
    analysesWithResult,
    totalReports,
    reportsWithStats,
  };
};


