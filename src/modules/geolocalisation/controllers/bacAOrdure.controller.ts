import createHttpError from "http-errors";
import mongoose from "mongoose";
import BacModel from "../models/bacAOrdure.model";
import ZoneModel from "../../administration/models/zone.model";
import { bacValidationSchema } from "../utils/validationSchema";
import { gerer, valider } from "../utils/http";

const idValide = (id: string) => {
  if (!mongoose.isValidObjectId(id)) throw createHttpError(400, "Identifiant invalide");
  return id;
};

const conflitCode = (e: any) => {
  if (e?.code === 11000) return createHttpError(409, "Un bac avec ce code existe déjà");
  return e;
};

// Distance en mètres entre deux points GPS (formule de haversine)
const distanceM = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const rad = (d: number) => (d * Math.PI) / 180;
  const a =
    Math.sin(rad(lat2 - lat1) / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(rad(lng2 - lng1) / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const creerBac = gerer(async (req, res) => {
  const data = await valider(bacValidationSchema, req.body);
  if (!(await ZoneModel.exists({ _id: data.zone }))) throw createHttpError(404, "Zone introuvable");
  try {
    const bac = await BacModel.create(data);
    res.status(201).json(bac);
  } catch (e) {
    throw conflitCode(e);
  }
});

export const listerBacs = gerer(async (req, res) => {
  const filtre: Record<string, any> = {};
  if (typeof req.query.zone === "string" && mongoose.isValidObjectId(req.query.zone)) {
    filtre.zone = req.query.zone;
  }
  const bacs = await BacModel.find(filtre).populate("zone", "nom").sort({ code: 1 });
  res.status(200).json(bacs);
});

// Bacs proches de la position du téléphone : ?lat=..&lng=..&rayon=2000 (mètres)
export const bacsProches = gerer(async (req, res) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  const rayonDemande = Number(req.query.rayon);
  const rayon = Number.isFinite(rayonDemande) && rayonDemande > 0 ? rayonDemande : 2000;
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    throw createHttpError(400, "Les paramètres lat et lng sont requis et doivent être valides.");
  }
  const bacs = await BacModel.find().populate("zone", "nom").lean();
  const resultat = bacs
    .map((b: any) => ({ ...b, distanceM: Math.round(distanceM(lat, lng, b.latitude, b.longitude)) }))
    .filter((b) => b.distanceM <= rayon)
    .sort((a, b) => a.distanceM - b.distanceM)
    .slice(0, 50);
  res.status(200).json(resultat);
});

export const getBac = gerer(async (req, res) => {
  const bac = await BacModel.findById(idValide(String(req.params.id))).populate("zone", "nom");
  if (!bac) throw createHttpError(404, "Bac à ordure non trouvé");
  res.status(200).json(bac);
});

export const modifierBac = gerer(async (req, res) => {
  const id = idValide(String(req.params.id));
  const data = await valider(bacValidationSchema, req.body);
  if (!(await ZoneModel.exists({ _id: data.zone }))) throw createHttpError(404, "Zone introuvable");
  try {
    const bac = await BacModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!bac) throw createHttpError(404, "Bac à ordure non trouvé");
    res.status(200).json(bac);
  } catch (e) {
    throw conflitCode(e);
  }
});

export const supprimerBac = gerer(async (req, res) => {
  const bac = await BacModel.findByIdAndDelete(idValide(String(req.params.id)));
  if (!bac) throw createHttpError(404, "Bac à ordure non trouvé");
  res.status(204).send();
});
