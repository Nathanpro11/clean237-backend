import Joi from "joi";

export const PermissionSchema = Joi.object({
  nom: Joi.string().lowercase().required().min(3),
  description: Joi.string().required().min(5)
});

export const RoleSchema = Joi.object({
  nom: Joi.string().lowercase().required().min(2),
  description: Joi.string().required().min(5),
  permissionsIds: Joi.array().items(Joi.string().length(24).hex()).required()
});

export const InscriptionUtilisateurSchema = Joi.object({
  nom: Joi.string().lowercase().required().min(3),
  email: Joi.string().lowercase().required().email(),
  motDepasse: Joi.string().required().min(6),
  telephone: Joi.string().required(),
  roleId: Joi.string().length(24).hex().optional().allow(null, ""), 
  matricule: Joi.string().optional().allow("", null),
  zoneAffectee: Joi.string().lowercase().optional().allow("", null)
});

export const UpsertUtilisateurSchema = Joi.object({
  nom: Joi.string().lowercase().required().min(3),
  email: Joi.string().lowercase().required().email(),
  motDepasse: Joi.string().required().min(6),
  telephone: Joi.string().required(),
  profil: Joi.string().lowercase().required().valid("admin", "agent", "citoyen"), 
  matricule: Joi.string().optional().allow("", null),
  zoneAffectee: Joi.string().lowercase().optional().allow("", null)
});

export const ModificationUtilisateurSchema = Joi.object({
  nom: Joi.string().lowercase().optional().min(3),
  email: Joi.string().lowercase().optional().email(),
  motDepasse: Joi.string().optional().min(6),
  telephone: Joi.string().optional(),
  matricule: Joi.string().optional().allow("", null),
  zoneAffectee: Joi.string().lowercase().optional().allow("", null)
});
