import Joi from "joi";

export const bacValidationSchema = Joi.object({
    code: Joi.string().required(),
    longueur: Joi.number().required(),
    largeur: Joi.number().required(),
    etat: Joi.string().optional(),
    contenance: Joi.number().required(),
    dateDerniereCollecte: Joi.date().optional(),
    zone: Joi.string().required(),
});

export const zoneValidationSchema = Joi.object({
    nom: Joi.string().required(),
    description: Joi.string().optional()
});