import Joi from 'joi';

export const idValidation = Joi.object({
  id: Joi.string().required()
});

export const reportValidation = Joi.object({
  titre: Joi.string().required(),
  description: Joi.string().optional(),
  analyseId: Joi.string().required(),
  statistiques: Joi.object().optional()
});

export const reportUpdateValidation = Joi.object({
  titre: Joi.string().optional(),
  description: Joi.string().optional(),
  analyseId: Joi.string().optional(),
  statistiques: Joi.object().optional()
});

export const analyseValidation = Joi.object({
  type: Joi.string().required(),
  periode: Joi.object({
    start: Joi.date().required(),
    end: Joi.date().required(),
  }).required(),
  donneesUtilisees: Joi.array().items(Joi.string()).optional()  ,
});

export const analyseUpdateValidation = Joi.object({
  type: Joi.string().optional(),
  periode: Joi.object({
    start: Joi.date().optional(),
    end: Joi.date().optional(),
  }).optional(),
  resultat: Joi.string().optional(),
  indicateurs: Joi.object().optional(),
  donneeEnvironnementaleId: Joi.string().optional(),
});
