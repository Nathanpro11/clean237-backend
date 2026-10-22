import Joi from "joi";

export const bacValidationSchema = Joi.object({
  code: Joi.string().trim().required(),
  longueur: Joi.number().positive().required(),
  largeur: Joi.number().positive().required(),
  etat: Joi.string().optional(),
  contenance: Joi.number().positive().required(),
  dateDerniereCollecte: Joi.date().optional(),
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
  zone: Joi.string().hex().length(24).required(),
});

export const localisationValidationSchema = Joi.object({
  libelle: Joi.string().trim().required(),
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
});
