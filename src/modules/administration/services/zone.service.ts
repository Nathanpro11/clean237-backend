import createHttpError from "http-errors";
import ZoneModel from "../models/zone.model";

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
