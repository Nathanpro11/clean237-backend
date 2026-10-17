import type { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import bcrypt from "bcrypt";
import crypto from "crypto";
import Utilisateur from "../models/utilisateur.model";
import { inscrireLogAction } from "../utilis/log.util";
import { envoyerCodeReinitialisation } from "../utilis/mail.util";

const DUREE_CODE_MS = 15 * 60 * 1000; // validité du code : 15 min
const DELAI_RENVOI_MS = 60 * 1000;    // un nouveau code au plus toutes les 60 s
const MAX_ESSAIS = 5;                 // essais de saisie avant invalidation du code

// ==========================================
// ÉTAPE 1 : DEMANDER UN CODE (réponse identique que le compte existe ou non)
// ==========================================
export const demanderCodeReinitialisationController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== "string") throw createHttpError(400, "Le champ 'email' est requis.");

    const user = await Utilisateur.findOne({ email: email.toLowerCase(), estActif: true });

    if (user) {
      const dernierEnvoi = user.resetTokenExpire ? user.resetTokenExpire.getTime() - DUREE_CODE_MS : 0;

      if (Date.now() - dernierEnvoi >= DELAI_RENVOI_MS) {
        const code = crypto.randomInt(100000, 1000000).toString();

        await Utilisateur.updateOne({ _id: user._id }, {
          $set: {
            resetTokenHash: await bcrypt.hash(code, 10),
            resetTokenExpire: new Date(Date.now() + DUREE_CODE_MS),
            resetTentatives: 0,
          },
        });

        try {
          await envoyerCodeReinitialisation(user.email, user.nom, code);
        } catch (e) {
          // Erreur côté serveur : on la journalise sans changer la réponse (pas d'énumération)
          console.error("Envoi du code par e-mail :", e);
        }

        await inscrireLogAction(user._id.toString(), "DEMANDE_REINITIALISATION", "Code de réinitialisation généré", req);
      }
    }

    return res.status(200).json({ message: "Si ce compte existe, un code a été envoyé par e-mail." });
  } catch (error) { next(error); }
};

// ==========================================
// ÉTAPE 2 : CONFIRMER AVEC LE CODE ET CHOISIR LE NOUVEAU MOT DE PASSE
// ==========================================
export const confirmerReinitialisationController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, code, nouveauMotDePasse } = req.body;
    if (!email || !code || !nouveauMotDePasse) {
      throw createHttpError(400, "Les champs 'email', 'code' et 'nouveauMotDePasse' sont requis.");
    }
    if (typeof nouveauMotDePasse !== "string" || nouveauMotDePasse.length < 6) {
      throw createHttpError(400, "Le mot de passe doit contenir au moins 6 caractères.");
    }

    const user = await Utilisateur.findOne({ email: String(email).toLowerCase(), estActif: true })
      .select("+resetTokenHash");

    // Même message pour compte inconnu, code absent, expiré ou faux
    if (!user || !user.resetTokenHash || !user.resetTokenExpire || user.resetTokenExpire.getTime() < Date.now()) {
      throw createHttpError(400, "Code invalide ou expiré.");
    }

    if ((user.resetTentatives ?? 0) >= MAX_ESSAIS) {
      await Utilisateur.updateOne({ _id: user._id }, { $unset: { resetTokenHash: "", resetTokenExpire: "" } });
      throw createHttpError(429, "Trop d'essais. Demandez un nouveau code.");
    }

    const valide = await bcrypt.compare(String(code), user.resetTokenHash);
    if (!valide) {
      await Utilisateur.updateOne({ _id: user._id }, { $inc: { resetTentatives: 1 } });
      throw createHttpError(400, "Code invalide ou expiré.");
    }

    // Code bon : nouveau mot de passe, code effacé, verrou anti-bruteforce levé
    await Utilisateur.updateOne({ _id: user._id }, {
      $set: {
        motDepasse: await bcrypt.hash(nouveauMotDePasse, 10),
        resetTentatives: 0,
        tentativesEchouees: 0,
      },
      $unset: { resetTokenHash: "", resetTokenExpire: "", bloqueJusquA: "" },
    });

    await inscrireLogAction(user._id.toString(), "CHANGEMENT_MOT_DE_PASSE", "Mot de passe réinitialisé via code e-mail", req);

    return res.status(200).json({ message: "Mot de passe réinitialisé avec succès." });
  } catch (error) { next(error); }
};