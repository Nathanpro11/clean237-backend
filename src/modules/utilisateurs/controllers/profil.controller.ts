import type { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import bcrypt from "bcrypt";
import Utilisateur from "../models/utilisateur.model";
import { inscrireLogAction } from "../utilis/log.util";
import Log from "../models/log.model";


export const getUtilisateurByIdController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const targetId = req.params.idUser;
    const user = await Utilisateur.findOne({ _id: targetId, estActif: true }).populate({ path: "roleId", populate: { path: "permissionsIds" } });
    if (!user) throw createHttpError(404, "Utilisateur introuvable ou inactif");
    return res.status(200).json(user);
  } catch (error) {
     next(error); 
    }
};


export const updateSelfController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await Utilisateur.findOneAndUpdate({ _id: req.params.idUser, estActif: true }, req.body, { new: true });
    if (!user) throw createHttpError(404, "Utilisateur introuvable ou inactif");
    return res.status(202).json({ message: "Profil mis à jour", data: user });
  } catch (error) {
     next(error); 
    }
};


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
  } catch (error) {
     next(error); 
    }
};


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

// FONCTIONNALITE AVANCEE RECHERCHE MULTI-CHAMPS
export const rechercheGlobaleController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { recherche } = req.query;
    if (!recherche || typeof recherche !== 'string') {
      throw createHttpError(400, "Le paramètre de recherche est requis");
    }

   
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

export const getDashboardStatsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await Utilisateur.findById(req.params.idUser).populate("roleId");
    if (!user || !user.estActif) throw createHttpError(404, "Utilisateur introuvable");

    const roleNom = (user.roleId as any)?.nom.toLowerCase();
    let statsSpecifiques: Record<string, any> = {};

    
    if (roleNom === "admin") {
      statsSpecifiques = {
        vueAbonnement: "Vue globale administrative",
        Indicateurs: { totalSignalementsYaounde: 142, agentsActifsTerrain: 18, alertesSaleteCritiques: 5 }
      };
    } else if (roleNom === "agent") {
      statsSpecifiques = {
        vueAbonnement: "Espace terrain agent de collecte",
        Indicateurs: { missionsAffectees: 4, collectesRealiseesAujourdhui: 3, zonePriseEnCharge: user.zoneAffectee || "Non assignée" }
      };
    } else {
      statsSpecifiques = {
        vueAbonnement: "Portail citoyen standard",
        Indicateurs: { mesSignalementsEmis: 2, pointsFideliteGagnes: 150, quartier: "Yaoundé VI" }
      };
    }

    return res.status(200).json({
      message: `Tableau de bord personnalisé pour le profil [${roleNom}]`,
      proprietaire: user.nom,
      statistiques: statsSpecifiques
    });
  } catch (error) { next(error); }
};

//FONCTIONNALITE AVANCEE TRACABILITE ET HISTRIQUE
export const getHistoriquePersonnelController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    
    const mesActions = await Log.find({ utilisateurId: req.params.idUser }).sort({ createdAt: -1 });
    
    return res.status(200).json({
      totalActionsEnregistrees: mesActions.length,
      utilisateurCible: req.params.idUser,
      historique: mesActions
    });
  } catch (error) { next(error); }
};