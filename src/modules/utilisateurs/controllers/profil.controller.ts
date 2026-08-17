import type { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import bcrypt from "bcrypt";
import Utilisateur from "../models/utilisateur.model";

// VOIR PROFIL (recherche par id / get_by_id)
export const getUtilisateurByIdController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const targetId = req.params.idUser;
    const user = await Utilisateur.findOne({ _id: targetId, estActif: true }).populate({ path: "roleId", populate: { path: "permissionsIds" } });
    if (!user) throw createHttpError(404, "Utilisateur introuvable ou inactif");
    return res.status(200).json(user);
  } catch (error) { next(error); }
};

// MODIFIER INFORMATIONS (update_by_id)
export const updateSelfController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await Utilisateur.findOneAndUpdate({ _id: req.params.idUser, estActif: true }, req.body, { new: true });
    if (!user) throw createHttpError(404, "Utilisateur introuvable ou inactif");
    return res.status(202).json({ message: "Profil mis à jour", data: user });
  } catch (error) { next(error); }
};

// CHANGE MOT DE PASSE
export const changePasswordController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ancienMotDePasse, nouveauMotDePasse } = req.body;
    const user = await Utilisateur.findById(req.params.idUser);
    if (!user) throw createHttpError(404, "Utilisateur introuvable");

    const match = await bcrypt.compare(ancienMotDePasse, user.motDepasse);
    if (!match) throw createHttpError(400, "L'ancien mot de passe est incorrect");

    const sel = await bcrypt.genSalt(10);
    user.motDepasse = await bcrypt.hash(nouveauMotDePasse, sel);
    await user.save();

    return res.status(200).json({ message: "Votre mot de passe a été modifié avec succès" });
  } catch (error) { next(error); }
};

// SUPPRIMER COMPTE (delete_by_admin & delete_my_account)
export const deleteUserController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const targetId = req.params.idUser;
    const user = await Utilisateur.findById(targetId);
    if (!user) throw createHttpError(404, "Utilisateur introuvable");
    if (user.estActif === false) throw createHttpError(400, "Opération impossible : Ce compte utilisateur est déjà désactivé");

    user.estActif = false;
    await user.save();
    return res.status(202).json({ message: "Le compte a été désactivé avec succès" });
  } catch (error) { next(error); }
};

// LISTE TOUT LE MONDE (getAll / list avec pagination et tri)
export const listerUtilisateursController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { actif, role, page, limit, tri, ordre } = req.query;
    const filtre: Record<string, any> = {};
    if (actif !== undefined) filtre.estActif = actif === 'true';

    const numPage = parseInt(page as string) || 1;
    const taillePage = parseInt(limit as string) || 10;
    const optionsTri = { [(tri as string) || "createdAt"]: ordre === "desc" ? -1 : 1 };

    const users = await Utilisateur.find(filtre)
      .sort(optionsTri as any)
      .skip((numPage - 1) * taillePage)
      .limit(taillePage)
      .populate({ path: "roleId", populate: { path: "permissionsIds" } });

    let result = users;
    if (role) result = users.filter((u: any) => u.roleId && u.roleId.nom.toLowerCase() === (role as string).toLowerCase());

    return res.status(200).json({
      pagination: { pageActuelle: numPage, totalElements: result.length },
      data: result
    });
  } catch (error) { next(error); }
};

export const rechercheGlobaleController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { recherche } = req.query;
    if (!recherche || typeof recherche !== 'string') {
      throw createHttpError(400, "Le paramètre de recherche est requis");
    }

    // 🎯 Avancé 3 : Recherche insensible à la casse sur plusieurs champs simultanément
    const regex = new RegExp(recherche, 'i');
    const resultats = await Utilisateur.find({
      estActif: true,
      $or: [
        { nom: regex },
        { email: regex },
        { matricule: regex }
      ]
    }).populate({ path: "roleId", populate: { path: "permissionsIds" } });

    return res.status(200).json({ total: resultats.length, data: resultats });
  } catch (error) { next(error); }
};
