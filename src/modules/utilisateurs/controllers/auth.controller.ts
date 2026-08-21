import type { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Role from "../models/role.model";
import Utilisateur from "../models/utilisateur.model";
import { verifierBlocageCompte, gererEchecConnexion, reinitialiserTentatives } from "../utilis/security.util"; // ✅ Corrigé le chemin s'il y avait une typo
import { inscrireLogAction } from "../utilis/log.util"; 

const JWT_SECRET = process.env.JWT_SECRET || "clean237_secret_key_super_secure";

// ==========================================
// 1. S'INSCRIRE (Création Admin, Agent, Citoyen)
// ==========================================
export const registerController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { nom, email, telephone, profil, zoneAffectee, matricule } = req.body;
    
    const passwordRaw = req.body.motDepasse || 
                        req.body.motDePasse || 
                        req.body.motdepasse || 
                        req.body.password ||
                        req.body.mot_de_passe;

    if (!passwordRaw) {
      return res.status(400).json({
        status: 400,
        message: "Échec : Le mot de passe est introuvable dans le corps de la requête. Écrivez 'motDePasse' ou 'motDepasse'."
      });
    }

    if (!email) {
      return res.status(400).json({ status: 400, message: "Échec : Le champ 'email' est obligatoire." });
    }

    const profilCible = profil ? profil.toLowerCase() : "citoyen";
    const roleTrouve = await Role.findOne({ nom: profilCible });
    if (!roleTrouve) throw createHttpError(404, `Le profil '${profil}' n'existe pas en base`);

    const sel = await bcrypt.genSalt(10);
    const motDePasseHache = await bcrypt.hash(passwordRaw, sel);

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

    await inscrireLogAction(user._id.toString(), "INSCRIPTION", `Création initiale du compte avec le profil : ${profilCible}`, req);

    return res.status(201).json({ 
      message: `Utilisateur créé avec succès en tant que '${profilCible}'`, 
      data: user 
    });
  } catch (error) { next(error); }
};


// ==========================================
//  SE CONNECTER SECURISEE FONNALITE AVANCE
// ==========================================
export const loginController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        status: 400,
        message: "Veuillez enregistrer les donnees de connexion "
      });
    }

    const { email } = req.body;
    
    
    const passwordRaw = req.body.motDepasse || 
                        req.body.motDePasse || 
                        req.body.motdepasse || 
                        req.body.password;

   
    if (!email || !passwordRaw) {
      return res.status(400).json({
        status: 400,
        message: "Les champs 'email' et 'motDepasse' (ou 'motDePasse') sont requis pour la connexion."
      });
    }

    const user = await Utilisateur.findOne({ email: email.toLowerCase(), estActif: true });
    if (!user) throw createHttpError(401, "Identifiants invalides ou compte inactif");

    // Fonctionnalité Avancée 1 : Protection Anti-Bruteforce
    verifierBlocageCompte(user);

    const motDePasseValide = await bcrypt.compare(passwordRaw, user.motDepasse);
    if (!motDePasseValide) {
      await gererEchecConnexion(user);
      throw createHttpError(401, "Identifiants invalides");
    }

    // Fonctionnalité Avancée 2 : Audit de connexion & réinitialisation des verrous
    await reinitialiserTentatives(user);
    await inscrireLogAction(user._id.toString(), "CONNEXION", `Connexion réussie à la session d'administration`, req);

    const token = jwt.sign({ idUser: user._id, roleId: user.roleId }, JWT_SECRET, { expiresIn: "24h" });
    return res.status(200).json({ 
      message: "Connexion réussie avec audit de session", 
      derniereConnexion: user.derniereConnexion, 
      token, 
      data: user 
    });
  } catch (error) { next(error); }
};


// ==========================================
// 3. RÉINITIALISER LE MOT DE PASSE
// ==========================================
export const resetPasswordRequestController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    if (!email) throw createHttpError(400, "Le champ 'email' est requis.");

    const user = await Utilisateur.findOne({ email: email.toLowerCase() });
    if (!user) throw createHttpError(404, "Aucun compte associé à cet e-mail");

    await inscrireLogAction(user._id.toString(), "DEMANDE_REINITIALISATION", `Demande de récupération de compte initiée`, req);

    return res.status(200).json({ message: "Demande reçue. Un lien de réinitialisation a été simulé." });
  } catch (error) { next(error); }
};
