import Joi from 'joi';

export const zoneValidation = Joi.object({
  nom: Joi.string().required(),
  quartier: Joi.string().required(),
  etat: Joi.string().valid('actif', 'inactif').default('actif')
}); 

export const idValidation = Joi.object({
  id: Joi.string().required()
});

export const reportValidation = Joi.object({
  titre: Joi.string().required(),
  description: Joi.string().optional(),
  zoneId: Joi.string().required(),
  statistiques: Joi.object({
    totalAlerts: Joi.number().required(),
    activeAlerts: Joi.number().required(),
    resolvedAlerts: Joi.number().required(),
    totalCollections: Joi.number().required(),
    completedCollections: Joi.number().required(),
    pendingCollections: Joi.number().required()
  }).required()
});

