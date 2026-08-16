import Joi from "joi";

export const bacValidationSchema = Joi.object({
    code: Joi.string().required(),
    longueur: Joi.number().required(),
    largeur: Joi.number().required(),
    etat: Joi.string().optional(),
    contenance: Joi.number().required(),
    dateDerniereCollecte: Joi.date().optional(),
    zone: Joi.string().hex().length(24).required()
});

export const zoneValidationSchema = Joi.object({
    nom: Joi.string().required(),
    description: Joi.string().optional()
});

export const localisationValidationSchema = Joi.object({
  libelle: Joi.string().required(),
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
  utilisateurId: Joi.string().optional()
});