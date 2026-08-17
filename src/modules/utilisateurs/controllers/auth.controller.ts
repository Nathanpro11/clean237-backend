import type { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Role from "../models/role.model";
import Utilisateur from "../models/utilisateur.model";
import { verifierBlocageCompte, gererEchecConnexion, reinitialiserTentatives } from "../utilis/security.util";

const JWT_SECRET = process.env.JWT_SECRET || "clean237_secret_key_super_secure";

// S'INSCRIRE (creation admin, agent, citoyen)
export const registerController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { nom, email, motDepasse, telephone, profil, zoneAffectee, matricule } = req.body;

    const profilCible = profil ? profil.toLowerCase() : "citoyen";
    const roleTrouve = await Role.findOne({ nom: profilCible });
    if (!roleTrouve) throw createHttpError(404, `Le profil '${profil}' n'existe pas en base`);

    const sel = await bcrypt.genSalt(10);
    const motDePasseHache = await bcrypt.hash(motDepasse, sel);

    const user = new Utilisateur({
      nom,
      email: email.toLowerCase(),
      motDepasse: motDePasseHache,
      telephone,
      roleId: roleTrouve._id,
      zoneAffectee,
      matricule
    });

    await user.save();
    await user.populate({ path: "roleId", populate: { path: "permissionsIds", model: "Permission" } });

    return res.status(201).json({ message: `Utilisateur créé avec succès en tant que '${profilCible}'`, data: user });
  } catch (error) { next(error); }
};

// SE CONNECTER (Version Avancée Unique : Anti-Bruteforce & Audit)
export const loginController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, motDepasse } = req.body;
    const user = await Utilisateur.findOne({ email: email.toLowerCase(), estActif: true });
    if (!user) throw createHttpError(401, "Identifiants invalides ou compte inactif");

    // 🎯 Avancé 1 : Vérification anti-bruteforce
    verifierBlocageCompte(user);

    const motDePasseValide = await bcrypt.compare(motDepasse, user.motDepasse);
    if (!motDePasseValide) {
      await gererEchecConnexion(user);
      throw createHttpError(401, "Identifiants invalides");
    }

    // 🎯 Avancé 2 : Réinitialisation des erreurs et audit de la dernière connexion
    await reinitialiserTentatives(user);

    const token = jwt.sign({ idUser: user._id, roleId: user.roleId }, JWT_SECRET, { expiresIn: "24h" });
    return res.status(200).json({ message: "Connexion réussie avec audit de session", derniereConnexion: user.derniereConnexion, token, data: user });
  } catch (error) { next(error); }
};

// REINITALISE MOT DE PASSE (Request)
export const resetPasswordRequestController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    const user = await Utilisateur.findOne({ email: email.toLowerCase() });
    if (!user) throw createHttpError(404, "Aucun compte associé à cet e-mail");
    return res.status(200).json({ message: "Demande reçue. Un lien de réinitialisation a été simulé." });
  } catch (error) { next(error); }
};
