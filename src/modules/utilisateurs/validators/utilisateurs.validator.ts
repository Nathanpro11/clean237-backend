import Joi from "joi";


export const InscriptionUtilisateurSchema = Joi.object({
    nom: Joi.string().lowercase().required().min(3),
    email: Joi.string().lowercase().required().email(),
    motDepasse: Joi.string().required().min(6),
    telephone: Joi.string().required(),
    roleId: Joi.string().required()
});


export const InscriptionAgentSchema = Joi.object({
    nom: Joi.string().lowercase().required().min(3),
    email: Joi.string().lowercase().required().email(),
    motDepasse: Joi.string().required().min(6),
    telephone: Joi.string().required(),
    roleId: Joi.string().required(),
    zoneAffectee: Joi.string().lowercase().required(),
    matricule: Joi.string().required()
});


export const ModificationUtilisateurSchema = Joi.object({
    nom: Joi.string().lowercase().optional().min(3),
    email: Joi.string().lowercase().optional().email(),
    motDepasse: Joi.string().optional().min(6),
    telephone: Joi.string().optional()
});
