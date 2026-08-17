import Joi from "joi";

// 1. Validation pour la création d'une Permission
export const PermissionSchema = Joi.object({
  nom: Joi.string().lowercase().required().min(3),
  description: Joi.string().required().min(5)
});

// 2. Validation pour la création d'un Rôle (avec un tableau d'IDs de permissions valides)
export const RoleSchema = Joi.object({
  nom: Joi.string().lowercase().required().min(2),
  description: Joi.string().required().min(5),
  permissionsIds: Joi.array().items(Joi.string().length(24).hex()).required()
});

// 3. Validation pour l'inscription simple d'un Utilisateur (roleId devient optionnel)
export const InscriptionUtilisateurSchema = Joi.object({
  nom: Joi.string().lowercase().required().min(3),
  email: Joi.string().lowercase().required().email(),
  motDepasse: Joi.string().required().min(6),
  telephone: Joi.string().required(),
  roleId: Joi.string().length(24).hex().optional().allow(null, ""), // ✅ Modifié en optionnel pour s'adapter à la création sans profil
  matricule: Joi.string().optional().allow("", null),
  zoneAffectee: Joi.string().lowercase().optional().allow("", null)
});

// 4. Validation pour la fonction Upsert (Création/Maj avec un profil textuel ex: "admin", "agent", "citoyen")
export const UpsertUtilisateurSchema = Joi.object({
  nom: Joi.string().lowercase().required().min(3),
  email: Joi.string().lowercase().required().email(),
  motDepasse: Joi.string().required().min(6),
  telephone: Joi.string().required(),
  profil: Joi.string().lowercase().required().valid("admin", "agent", "citoyen"), // ✅ Validation stricte du profil attendu
  matricule: Joi.string().optional().allow("", null),
  zoneAffectee: Joi.string().lowercase().optional().allow("", null)
});

// 5. Validation pour la modification des informations (par le citoyen, l'agent ou l'admin)
export const ModificationUtilisateurSchema = Joi.object({
  nom: Joi.string().lowercase().optional().min(3),
  email: Joi.string().lowercase().optional().email(),
  motDepasse: Joi.string().optional().min(6),
  telephone: Joi.string().optional(),
  matricule: Joi.string().optional().allow("", null),
  zoneAffectee: Joi.string().lowercase().optional().allow("", null)
});
