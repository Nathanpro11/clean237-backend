import Joi from "joi";

export const idValidation = Joi.object({
  id: Joi.string().hex().length(24).required().messages({
    "string.hex": "Identifiant invalide",
    "string.length": "Identifiant invalide",
    "any.required": "Identifiant invalide",
  }),
});

export const zoneValidation = Joi.object({
  nom: Joi.string().trim().min(2).required().messages({
    "string.min": "Le nom doit contenir au moins 2 caractères.",
    "any.required": "Le nom est requis.",
  }),
});

export const reportValidation = Joi.object({
  titre: Joi.string().trim().min(4).max(80).required().messages({
    "string.min": "Le titre doit contenir entre 4 et 80 caractères.",
    "string.max": "Le titre doit contenir entre 4 et 80 caractères.",
    "any.required": "Le titre est requis.",
  }),
  description: Joi.string().trim().max(300).optional().allow("").messages({
    "string.max": "La description ne peut pas dépasser 300 caractères.",
  }),
  analyseId: Joi.string().hex().length(24).required().messages({
    "string.hex": "Identifiant invalide",
    "string.length": "Identifiant invalide",
    "any.required": "Identifiant invalide",
  }),
});

export const analyseValidation = Joi.object({
  type: Joi.string().trim().default("global_environment_analysis").messages({
    "string.empty": "Le type est invalide.",
  }),
  periode: Joi.object({
    start: Joi.date().iso().required(),
    end: Joi.date().iso().required(),
  }).optional(),
});

export const donneeQueryValidation = Joi.object({
  zoneId: Joi.string().hex().length(24).optional().messages({
    "string.hex": "Identifiant invalide",
    "string.length": "Identifiant invalide",
  }),
  type: Joi.string().trim().optional().messages({
    "string.empty": "Le type est invalide.",
  }),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  sort: Joi.string().valid("date", "createdAt").optional(),
  order: Joi.string().valid("asc", "desc").optional(),
}).messages({
  "number.min": "La pagination est invalide.",
  "number.max": "La pagination est invalide.",
});

