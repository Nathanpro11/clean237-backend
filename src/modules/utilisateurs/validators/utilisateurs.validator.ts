import Joi from 'joi';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const InscriptionUtilisateurSchema = Joi.object({
  nom: Joi.string().min(2).trim().required().messages({
      'string.empty': 'Le nom ne peut pas être vide',
      'string.min': 'Le nom doit contenir au moins 2 caractères',
      'any.required': 'Le nom est un champ obligatoire'
    }),

  email: Joi.string().email().trim().lowercase().required().messages({
      'string.email': "L'adresse email n'est pas valide",
      'any.required': "L'email est un champ obligatoire"
    }),

  motDepasse: Joi.string().min(6).required().messages({
      'string.min': 'Le mot de passe doit contenir au moins 6 caractères',
      'any.required': 'Le mot de passe est un champ obligatoire'
    }),

  telephone: Joi.string().required().trim().messages({
      'string.pattern.base': 'Le numéro de téléphone doit être un numéro camerounais valide (ex: +237XXXXXXXX)',
      'any.required': 'Le numéro de téléphone est un champ obligatoire'
    }),

  roleId: Joi.string().required().messages({
      'string.pattern.base': "L'identifiant du rôle doit être un ID Mongoose (ObjectId) valide",
      'any.required': 'Le roleId est un champ obligatoire'
    })
});


export const InscriptionAgentSchema = InscriptionUtilisateurSchema.append({
  zoneAffectee: Joi.string().min(2).trim().required().messages({
      'string.min': 'La zone affectée doit contenir au moins 2 caractères',
      'any.required': 'La zone affectée est un champ obligatoire'
    }),

  matricule: Joi.string().min(3).trim().required().messages({
      'string.min': 'Le matricule doit contenir au moins 3 caractères',
      'any.required': 'Le matricule est un champ obligatoire'
    })
});


export const ModificationUtilisateurSchema = InscriptionUtilisateurSchema.fork(
  ['nom', 'email', 'motDepasse', 'telephone', 'roleId'],
  (schema) => schema.optional()
).append({
  roleId: Joi.any().forbidden().messages({
    'any.unknown': "La modification du rôle n'est pas autorisée via cette route"
  }) 
});
