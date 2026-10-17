import type { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import Utilisateur from "../models/utilisateur.model";
import { creerOuMettreAJourUtilisateur } from "../services/utilisateur.service";

// Création d'un compte (citoyen / agent / admin) par un administrateur.
// Refuse un email déjà utilisé au lieu d'écraser le compte existant.
export const creerParAdminController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { nom, email, telephone, motDepasse, profil } = req.body;
    if (!nom || !email || !telephone || !motDepasse || !profil) {
      throw createHttpError(400, "Champs requis : nom, email, telephone, motDepasse, profil");
    }
    if (String(motDepasse).length < 6) throw createHttpError(400, "Mot de passe : 6 caractères minimum.");
    if (!["admin", "agent", "citoyen"].includes(String(profil).toLowerCase())) {
      throw createHttpError(400, "Profil invalide (admin, agent ou citoyen)");
    }
    if (await Utilisateur.exists({ email: String(email).toLowerCase().trim() })) {
      throw createHttpError(409, "Cet email est déjà utilisé.");
    }

    const resultat = await creerOuMettreAJourUtilisateur(req.body);
    return res.status(201).json(resultat);
  } catch (error) { next(error); }
};

// Activation / désactivation d'un compte (suppression logique réversible).
export const changerStatutController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { estActif } = req.body;
    if (typeof estActif !== "boolean") throw createHttpError(400, "estActif (booléen) requis");

    const moi = (req as any).user;
    if (String(moi._id) === req.params.idUser && estActif === false) {
      throw createHttpError(400, "Vous ne pouvez pas désactiver votre propre compte.");
    }

    const user = await Utilisateur.findByIdAndUpdate(req.params.idUser, { estActif }, { returnDocument: "after" })
      .populate({ path: "roleId", populate: { path: "permissionsIds", model: "Permission" } });
    if (!user) throw createHttpError(404, "Utilisateur introuvable");

    return res.status(200).json({ message: estActif ? "Compte réactivé" : "Compte désactivé", data: user });
  } catch (error) { next(error); }
};