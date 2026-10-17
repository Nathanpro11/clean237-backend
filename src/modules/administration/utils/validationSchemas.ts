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
  type: Joi.string().valid("synthese", "suivi", "export").optional().default("synthese"),
  statut: Joi.string().valid("pret", "en_cours", "archive").optional().default("pret"),
  format: Joi.string().valid("pdf", "csv").optional().default("pdf"),
  zones: Joi.array().items(
    Joi.object({
      _id: Joi.string().hex().length(24).required(),
      nom: Joi.string().trim().min(1).required(),
    })
  ).optional(),
});

export const analyseValidation = Joi.object({
  type: Joi.string().trim().default("global_environment_analysis").messages({
    "string.empty": "Le type est invalide.",
  }),
  zoneId: Joi.string().hex().length(24).optional().messages({
    "string.hex": "Identifiant invalide",
    "string.length": "Identifiant invalide",
  }),
  periode: Joi.object({
    start: Joi.date().iso().required(),
    end: Joi.date().iso().required(),
  }).optional(),
});

export const getAlertesQueryValidation = Joi.object({
  severite: Joi.string().valid("critique", "avertissement", "info").optional(),
  zoneId: Joi.string().hex().length(24).optional().messages({
    "string.hex": "Identifiant invalide",
    "string.length": "Identifiant invalide",
  }),
  statut: Joi.string().valid("active", "traitee").optional(),
  search: Joi.string().trim().optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  sort: Joi.string().valid("date", "createdAt").optional(),
  order: Joi.string().valid("asc", "desc").optional(),
}).messages({
  "number.min": "La pagination est invalide.",
  "number.max": "La pagination est invalide.",
});

export const reportStatusValidation = Joi.object({
  statut: Joi.string().valid("pret", "en_cours", "archive").required().messages({
    "any.only": "Le statut du rapport est invalide.",
    "any.required": "Le statut du rapport est requis.",
  }),
});

export const exportFormatValidation = Joi.object({
  format: Joi.string().valid("pdf", "csv").required().messages({
    "any.only": "Le format d'export est invalide.",
    "any.required": "Le format d'export est requis.",
  }),
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

