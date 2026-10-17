import DonneeModel from "../models/donneeEnvironnementale.model";
import ZoneModel from "../models/zone.model";

const getLevel = (score: number): "critique" | "problématique" | "à surveiller" | "normal" => {
  if (score >= 80) return "critique";
  if (score >= 60) return "problématique";
  if (score >= 40) return "à surveiller";
  return "normal";
};

export const detectProblematicZones = async () => {
  const results = await DonneeModel.aggregate([
    {
      $group: {
        _id: "$zoneId",
        alertCount: {
          $sum: {
            $cond: [{ $eq: ["$type", "alerte"] }, 1, 0],
          },
        },
        dataCount: { $sum: 1 },
        derniereDonnee: { $max: "$date" },
      },
    },
    {
      $lookup: {
        from: "zones",
        localField: "_id",
        foreignField: "_id",
        as: "zone",
      },
    },
    {
      $project: {
        _id: 0,
        zoneId: "$_id",
        nom: { $ifNull: [{ $arrayElemAt: ["$zone.nom", 0] }, "Zone inconnue"] },
        alertCount: 1,
        dataCount: 1,
        derniereDonnee: 1,
      },
    },
  ]);

  const zones = results
    .map((zone) => {
      const alertScore = Math.min(zone.alertCount * 10, 100);
      const score = Math.round(alertScore);
      return {
        zoneId: zone.zoneId.toString(),
        nom: zone.nom,
        score,
        niveau: getLevel(score),
        details: {
          alertScore: Math.round(alertScore),
          alertCount: zone.alertCount,
          dataCount: zone.dataCount,
          derniereDonnee: zone.derniereDonnee ? new Date(zone.derniereDonnee).toISOString() : null,
        },
      };
    })
    .sort((a, b) => b.score - a.score);

  return zones;
};


