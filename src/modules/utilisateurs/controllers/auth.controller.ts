import type { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Role from "../models/role.model";
import Utilisateur from "../models/utilisateur.model";
import { verifierBlocageCompte, gererEchecConnexion, reinitialiserTentatives } from "../utilis/security.util";
import { inscrireLogAction } from "../utilis/log.util";
import { getJwtSecret } from "../middlewares/auth.middleware";

const POPULATE_ROLE = { path: "roleId", populate: { path: "permissionsIds", model: "Permission" } };

const lireMotDePasse = (body: any): string | undefined =>
  body.motDepasse || body.motDePasse || body.motdepasse || body.password || body.mot_de_passe;

// ==========================================
// 1. S'INSCRIRE (public : crée TOUJOURS un citoyen)
// La création d'agents/admins passe par POST /admin/create (protégée).
// ==========================================
export const registerController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { nom, email, telephone } = req.body;
    const passwordRaw = lireMotDePasse(req.body);

    if (!nom) throw createHttpError(400, "Le champ 'nom' est obligatoire.");
    if (!email) throw createHttpError(400, "Le champ 'email' est obligatoire.");
    if (!telephone) throw createHttpError(400, "Le champ 'telephone' est obligatoire.");
    if (!passwordRaw) throw createHttpError(400, "Le mot de passe est introuvable (champ 'motDepasse').");
    if (String(passwordRaw).length < 6) throw createHttpError(400, "Mot de passe : 6 caractères minimum.");

    const emailNormalise = String(email).toLowerCase().trim();
    if (await Utilisateur.exists({ email: emailNormalise })) {
      throw createHttpError(409, "Cet email est déjà utilisé.");
    }

    const roleTrouve = await Role.findOne({ nom: "citoyen" });
    if (!roleTrouve) throw createHttpError(500, "Le rôle 'citoyen' n'existe pas en base (initialisation manquante).");

    const sel = await bcrypt.genSalt(10);
    const motDePasseHache = await bcrypt.hash(String(passwordRaw), sel);

    const user = new Utilisateur({
      nom,
      email: emailNormalise,
      motDepasse: motDePasseHache,
      telephone,
      roleId: roleTrouve._id
    });

    await user.save();
    await user.populate(POPULATE_ROLE);

    await inscrireLogAction(user._id.toString(), "INSCRIPTION", "Création initiale du compte avec le profil : citoyen", req);

    return res.status(201).json({ message: "Compte créé avec succès", data: user });
  } catch (error) { next(error); }
};

// ==========================================
// 2. SE CONNECTER (anti-bruteforce + audit)
// ==========================================
export const loginController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      throw createHttpError(400, "Veuillez renseigner les données de connexion.");
    }

    const { email } = req.body;
    const passwordRaw = lireMotDePasse(req.body);

    if (!email || !passwordRaw) {
      throw createHttpError(400, "Les champs 'email' et 'motDepasse' sont requis pour la connexion.");
    }

    const user = await Utilisateur.findOne({ email: String(email).toLowerCase().trim(), estActif: true });
    if (!user) throw createHttpError(401, "Identifiants invalides ou compte inactif");

    verifierBlocageCompte(user);

    const motDePasseValide = await bcrypt.compare(String(passwordRaw), user.motDepasse);
    if (!motDePasseValide) {
      await gererEchecConnexion(user);
      throw createHttpError(401, "Identifiants invalides");
    }

    await reinitialiserTentatives(user);
    await inscrireLogAction(user._id.toString(), "CONNEXION", "Connexion réussie", req);
    await user.populate(POPULATE_ROLE);

    // Le nom du rôle est dans le token : le front le lit pour router l'utilisateur.
    const token = jwt.sign(
      { idUser: user._id, role: (user.roleId as any)?.nom },
      getJwtSecret(),
      { expiresIn: "24h" }
    );

    return res.status(200).json({
      message: "Connexion réussie",
      derniereConnexion: user.derniereConnexion,
      token,
      data: user
    });
  } catch (error) { next(error); }
};

// ==========================================
// 3. DEMANDE DE RÉINITIALISATION (réponse identique que le compte existe ou non)
// ==========================================
export const resetPasswordRequestController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    if (!email) throw createHttpError(400, "Le champ 'email' est requis.");

    const user = await Utilisateur.findOne({ email: String(email).toLowerCase().trim() });
    if (user) {
      await inscrireLogAction(user._id.toString(), "DEMANDE_REINITIALISATION", "Demande de récupération de compte initiée", req);
    }

    return res.status(200).json({ message: "Si ce compte existe, un lien de réinitialisation a été envoyé." });
  } catch (error) { next(error); }
};