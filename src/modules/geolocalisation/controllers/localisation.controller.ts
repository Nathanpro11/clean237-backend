import createHttpError from "http-errors";
import mongoose from "mongoose";
import LocalisationModel from "../models/localisation.model";
import { localisationValidationSchema } from "../utils/validationSchema";
import { gerer, idUtilisateur, valider } from "../utils/http";

// L'utilisateur vient du jeton : il n'est jamais lu dans le corps de la requête.
export const creerLocalisation = gerer(async (req, res) => {
  const data = await valider(localisationValidationSchema, req.body);
  const localisation = await LocalisationModel.create({ ...data, utilisateurId: idUtilisateur(req) });
  res.status(201).json(localisation);
});

export const mesLocalisations = gerer(async (req, res) => {
  const liste = await LocalisationModel.find({ utilisateurId: idUtilisateur(req) })
    .sort({ createdAt: -1 })
    .limit(50);
  res.status(200).json(liste);
});

export const supprimerLocalisation = gerer(async (req, res) => {
  const id = String(req.params.id);
  if (!mongoose.isValidObjectId(id)) throw createHttpError(400, "Identifiant invalide");
  const supprimee = await LocalisationModel.findOneAndDelete({ _id: id, utilisateurId: idUtilisateur(req) });
  if (!supprimee) throw createHttpError(404, "Localisation non trouvée");
  res.status(204).send();
});
