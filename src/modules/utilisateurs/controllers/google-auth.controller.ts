import type { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import Role from "../models/role.model";
import Utilisateur from "../models/utilisateur.model";
import { inscrireLogAction } from "../utilis/log.util";
import { getJwtSecret } from "../middlewares/auth.middleware";

// Création paresseuse : dotenv.config() s'exécute après les imports dans app.ts
let client: OAuth2Client | null = null;
const getClient = (): OAuth2Client => {
  if (!client) client = new OAuth2Client();
  return client;
};

// ==========================================
// CONNEXION / INSCRIPTION AVEC GOOGLE (POST /google)
// Reçoit { idToken } : le jeton d'identité obtenu par l'application avec le compte Google.
// Le serveur le VÉRIFIE auprès de Google : on ne fait jamais confiance à un e-mail envoyé par le client.
// ==========================================
export const googleLoginController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idToken } = req.body;
    if (!idToken || typeof idToken !== "string") throw createHttpError(400, "Le champ 'idToken' est requis.");

    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) throw new Error("GOOGLE_CLIENT_ID manquant dans le .env");

    // Vérifie la signature, l'expiration et que le jeton est bien destiné à NOTRE application
    let payload;
    try {
      const ticket = await getClient().verifyIdToken({ idToken, audience: clientId });
      payload = ticket.getPayload();
    } catch {
      throw createHttpError(401, "Jeton Google invalide ou expiré.");
    }

    if (!payload?.sub || !payload.email || !payload.email_verified) {
      throw createHttpError(401, "L'adresse e-mail de ce compte Google n'est pas vérifiée.");
    }

    const email = payload.email.toLowerCase();
    let user = await Utilisateur.findOne({ email });

    if (user) {
      if (!user.estActif) throw createHttpError(401, "Identifiants invalides ou compte inactif");

      // Pas de fusion automatique avec un compte créé par e-mail et mot de passe :
      // l'inscription ne vérifie pas l'e-mail, donc quelqu'un aurait pu créer ce compte à l'avance.
      if (user.googleId !== payload.sub) {
        throw createHttpError(409, "Un compte existe déjà avec cette adresse. Connectez-vous avec votre mot de passe.");
      }
    } else {
      // Nouveau compte Google : TOUJOURS citoyen (jamais agent ni admin)
      const role = await Role.findOne({ nom: "citoyen" });
      if (!role) throw createHttpError(404, "Le profil 'citoyen' n'existe pas en base");

      user = new Utilisateur({
        nom: payload.name || email.split("@")[0],
        email,
        // Mot de passe aléatoire inconnu de tous : ce compte se connecte uniquement via Google
        motDepasse: await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 10),
        telephone: "Non renseigné", // champ obligatoire du modèle ; modifiable ensuite dans le profil
        roleId: role._id,
        googleId: payload.sub,
      });
      await user.save();
      await inscrireLogAction(user._id.toString(), "INSCRIPTION", "Création du compte via Google (profil citoyen)", req);
    }

    user.derniereConnexion = new Date();
    await user.save();
    await user.populate({ path: "roleId", populate: { path: "permissionsIds", model: "Permission" } });

    await inscrireLogAction(user._id.toString(), "CONNEXION", "Connexion réussie via Google", req);

    // Même contenu de jeton que la connexion classique : { idUser, role } (le nom du rôle)
    const roleNom = (user.roleId as any)?.nom ?? "citoyen";
    const token = jwt.sign({ idUser: user._id, role: roleNom }, getJwtSecret(), { expiresIn: "24h" });

    return res.status(200).json({
      message: "Connexion Google réussie",
      token,
      data: user,
    });
  } catch (error) { next(error); }
};