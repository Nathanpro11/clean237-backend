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