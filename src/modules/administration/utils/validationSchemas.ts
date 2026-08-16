import Joi from 'joi';

export const zoneValidation = Joi.object({
  nom: Joi.string().required().messages({
    'string.empty': 'Le nom de la zone est requis.',
    'any.required': 'Le nom de la zone est requis.'
  }),
  quartier: Joi.string().required().messages({
    'string.empty': 'Le quartier de la zone est requis.',
    'any.required': 'Le quartier de la zone est requis.'
  }),
  etat: Joi.string().valid('actif', 'inactif').default('actif').messages({
    'any.only': 'L\'état de la zone doit être "actif" ou "inactif".'
  })
}); 

export const idValidation = Joi.object({
  id: Joi.string().required().messages({
    "string.empty": "L'identifiant est requis.",
    "any.required": "L'identifiant est requis."
  })
});

export const reportValidation = Joi.object({
  titre: Joi.string().required().messages({
    'string.empty': 'Le titre du rapport est requis.',
    'any.required': 'Le titre du rapport est requis.'
  }),
  description: Joi.string().optional(),
  zoneId: Joi.string().required().messages({
    'string.empty': 'L\'identifiant de la zone est requis.',
    'any.required': 'L\'identifiant de la zone est requis.'
  }),
  statistiques: Joi.object({
    totalAlerts: Joi.number().required(),
    activeAlerts: Joi.number().required(),
    resolvedAlerts: Joi.number().required(),
    totalCollections: Joi.number().required(),
    completedCollections: Joi.number().required(),
    pendingCollections: Joi.number().required()
  }).required().messages({
    'any.required': 'Les statistiques sont requises.'
  })
});

export const reportUpdateValidation = Joi.object({
  titre: Joi.string().optional(),
  description: Joi.string().optional(),
  zoneId: Joi.string().optional(),
  statistiques: Joi.object({
    totalAlerts: Joi.number().optional(),
    activeAlerts: Joi.number().optional(),
    resolvedAlerts: Joi.number().optional(),
    totalCollections: Joi.number().optional(),
    completedCollections: Joi.number().optional(),
    pendingCollections: Joi.number().optional()
  }).optional()
});