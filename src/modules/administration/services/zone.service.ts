import createHttpError from "http-errors";

import DonneeModel from "../models/donneeEnvironnementale.model";
import ZoneModel from "../models/zone.model";

const getLevel = (score: number): "critique" | "problématique" | "à surveiller" | "normal" => {
  if (score >= 80) return "critique";
  if (score >= 60) return "problématique";
  if (score >= 40) return "à surveiller";
  return "normal";
};

const getScoreFromAlertCount = (count: number): number => Math.min(count * 10, 100);

const getAlertScoreForWindow = async (zoneId: string, startOffset: number, endOffset: number): Promise<number> => {
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const start = new Date(end);
  start.setDate(start.getDate() - endOffset);
  start.setHours(0, 0, 0, 0);

  const windowEnd = new Date(end);
  windowEnd.setDate(windowEnd.getDate() - startOffset);
  windowEnd.setHours(23, 59, 59, 999);

  const count = await DonneeModel.countDocuments({
    zoneId,
    type: "alerte",
    date: { $gte: start, $lte: windowEnd },
  });

  return getScoreFromAlertCount(count);
};

const getEvolution30Jours = async (zoneId: string) => {
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const points: Array<{ date: string; score: number }> = [];

  for (let offset = 29; offset >= 0; offset -= 1) {
    const start = new Date(today);
    start.setDate(today.getDate() - offset);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setHours(23, 59, 59, 999);

    const count = await DonneeModel.countDocuments({
      zoneId,
      type: "alerte",
      date: { $gte: start, $lte: end },
    });

    points.push({
      date: start.toISOString(),
      score: getScoreFromAlertCount(count),
    });
  }

  return points;
};

export const getZones = async () => {
  const zones = await ZoneModel.find({}, { nom: 1 }).sort({ nom: 1 });
  return zones.map((zone) => ({
    _id: zone._id,
    nom: zone.nom,
  }));
};

export const getZoneById = async (id: string) => {
  const zone = await ZoneModel.findById(id);
  if (!zone) {
    throw createHttpError(404, "Zone introuvable");
  }

  return {
    _id: zone._id,
    nom: zone.nom,
  };
};

export const getZoneDetails = async (id: string) => {
  const zone = await ZoneModel.findById(id);
  if (!zone) {
    throw createHttpError(404, "Zone introuvable");
  }

  const [alertCount, dataCount, derniereDonnee, score7DaysAgo, evolution30Jours] = await Promise.all([
    DonneeModel.countDocuments({ zoneId: zone._id, type: "alerte", statut: "active" }),
    DonneeModel.countDocuments({ zoneId: zone._id }),
    DonneeModel.findOne({ zoneId: zone._id }).sort({ date: -1 }).lean(),
    getAlertScoreForWindow(zone._id.toString(), 7, 13),
    getEvolution30Jours(zone._id.toString()),
  ]);

  const score = getScoreFromAlertCount(alertCount);
  const niveau = getLevel(score);
  const scoreActuel = await getAlertScoreForWindow(zone._id.toString(), 0, 6);
  const evolutionPoints = scoreActuel - score7DaysAgo;

  const interpretation = (() => {
    if (niveau === "critique" && evolutionPoints > 0) {
      return `La situation se dégrade : ${alertCount} alertes actives, tendance à la hausse depuis une semaine.`;
    }
    if (niveau === "critique") {
      return `Zone critique : ${alertCount} alertes actives. Intervention prioritaire recommandée.`;
    }
    if (niveau === "problématique" || niveau === "à surveiller") {
      return `Zone à surveiller : ${alertCount} alertes actives.`;
    }
    return "Situation maîtrisée : aucune alerte active nécessitant une intervention.";
  })();

  const priorites = (() => {
    if (niveau === "critique") {
      return [
        "Planifier une collecte sous 24 h",
        `Traiter les ${alertCount} alertes actives`,
      ];
    }
    if (niveau === "problématique" || niveau === "à surveiller") {
      return [
        "Renforcer le suivi de la zone",
        `Traiter les ${alertCount} alertes actives`,
      ];
    }
    return ["Maintenir la fréquence de collecte actuelle"];
  })();

  return {
    _id: zone._id,
    nom: zone.nom,
    score,
    niveau,
    evolutionPoints,
    derniereMiseAJour: derniereDonnee?.date ? new Date(derniereDonnee.date).toISOString() : null,
    evolution30Jours: evolution30Jours.map((point) => ({
      date: point.date,
      score: point.score,
    })),
    alertCount,
    dataCount,
    interpretation,
    priorites,
  };
};
