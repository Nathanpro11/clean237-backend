import type { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import bcrypt from "bcrypt";
import Permission from "../models/permission.model";
import Role from "../models/role.model";
import Utilisateur from "../models/utilisateur.model";
import { creerOuMettreAJourUtilisateur } from "../services/utilisateur.service";

// --- PERMISSIONS (CRUD Complet) ---
export const createPermissionController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const perm = new Permission(req.body);
    await perm.save();
    return res.status(201).json({ message: "Permission créée avec succès", data: perm });
  } catch (error) { next(error); }
};

export const listerPermissionsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const perms = await Permission.find();
    return res.status(200).json(perms);
  } catch (error) { next(error); }
};

export const getPermissionByIdController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const perm = await Permission.findById(req.params.id);
    if (!perm) throw createHttpError(404, "Permission introuvable");
    return res.status(200).json(perm);
  } catch (error) { next(error); }
};

export const updatePermissionController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const perm = await Permission.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!perm) throw createHttpError(404, "Permission introuvable");
    return res.status(200).json({ message: "Permission mise à jour", data: perm });
  } catch (error) { next(error); }
};

export const deletePermissionController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const perm = await Permission.findByIdAndDelete(req.params.id);
    if (!perm) throw createHttpError(404, "Permission introuvable");
    return res.status(200).json({ message: "Permission supprimée avec succès" });
  } catch (error) { next(error); }
};


// --- RÔLES (CRUD Complet) ---
export const createRoleController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const role = new Role(req.body);
    await role.save();
    return res.status(201).json({ message: "Rôle créé avec succès", data: role });
  } catch (error) { next(error); }
};

export const listerRolesController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const roles = await Role.find().populate("permissionsIds");
    return res.status(200).json(roles);
  } catch (error) { next(error); }
};

export const getRoleByIdController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const role = await Role.findById(req.params.id).populate("permissionsIds");
    if (!role) throw createHttpError(404, "Rôle introuvable");
    return res.status(200).json(role);
  } catch (error) { next(error); }
};

export const updateRoleController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const role = await Role.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate("permissionsIds");
    if (!role) throw createHttpError(404, "Rôle introuvable");
    return res.status(200).json({ message: "Rôle mis à jour", data: role });
  } catch (error) { next(error); }
};

export const deleteRoleController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const role = await Role.findByIdAndDelete(req.params.id);
    if (!role) throw createHttpError(404, "Rôle introuvable");
    return res.status(200).json({ message: "Rôle supprimé avec succès" });
  } catch (error) { next(error); }
};


// --- UTILISATEURS ---

// ✅ CORRIGÉ & AMÉLIORÉ : Création avec attribution de rôle automatique via le champ "profil" (ex: "agent")
export const createUserConroller = async (req: Request, res: Response, next: NextFunction) => {
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

export const listerUtilisateursController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { actif, role } = req.query;
    const filtre: Record<string, any> = {};

    // 1. Filtrer par statut actif/inactif si spécifié dans l'URL (ex: ?actif=false)
    if (actif !== undefined) {
      filtre.estActif = actif === 'true';
    }

    // 2. Préparer la requête de base
    let query = Utilisateur.find(filtre).populate({
      path: "roleId",
      populate: { path: "permissionsIds", model: "Permission" }
    });

    const users = await query;

    // 3. Filtrer par nom de rôle si demandé (ex: ?role=agent)
    if (role && typeof role === 'string') {
      const filteredUsers = users.filter((u: any) => u.roleId && u.roleId.nom.toLowerCase() === role.toLowerCase());
      return res.status(200).json({
        total: filteredUsers.length,
        filtreApplique: { actif, role },
        data: filteredUsers
      });
    }

    return res.status(200).json({
      total: users.length,
      filtreApplique: { actif, role: null },
      data: users
    });
  } catch (error) { 
    next(error); 
  }
};


export const getUtilisateurByIdController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const targetId = req.params.idUser || req.params.id;
    
    // ✅ MODIFIÉ : On cherche uniquement un utilisateur actif. S'il est désactivé, il devient introuvable.
    const user = await Utilisateur.findOne({ _id: targetId, estActif: true }).populate({ 
      path: "roleId", 
      populate: { path: "permissionsIds" } 
    });
    
    if (!user) throw createHttpError(404, "Utilisateur introuvable ou compte déjà désactivé");
    return res.status(200).json(user);
  } catch (error) { next(error); }
};


export const updateSelfController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const targetId = req.params.idUser || req.params.id;
    const user = await Utilisateur.findOneAndUpdate(
      { _id: targetId, estActif: true },
      req.body,
      { new: true }
    );
    if (!user) throw createHttpError(404, "Utilisateur introuvable ou inactif");
    return res.status(202).json({ message: "Profil mis à jour", data: user });
  } catch (error) { next(error); }
};

export const deleteUserByAdminController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const targetId = req.params.idUser || req.params.id;

    // A. Récupérer le compte pour analyser son état actuel
    const user = await Utilisateur.findById(targetId);
    if (!user) throw createHttpError(404, "Utilisateur introuvable");

    // ✅ B. LEVÉE D'EXCEPTION : Si le citoyen ou l'agent a déjà clos son compte, l'admin est bloqué
    if (user.estActif === false) {
      throw createHttpError(400, "Opération impossible : Ce compte utilisateur est déjà désactivé");
    }

    // C. Exécuter la désactivation physique si le compte était actif
    user.estActif = false;
    await user.save();

    return res.status(202).json({ message: "Le compte a été désactivé avec succès par l'administrateur" });
  } catch (error) { next(error); }
};


export const upsertUtilisateurController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const resultat = await creerOuMettreAJourUtilisateur(req.body);
    return res.status(200).json(resultat);
  } catch (error) { next(error); }
};

export const assignRoleByIdController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role, permission } = req.body; 
    const targetId = req.params.idUser || req.params.id;

    const user = await Utilisateur.findById(targetId);
    if (!user) throw createHttpError(404, "Utilisateur introuvable");

    if (role) {
      const roleDoc = await Role.findOne({ nom: role.toLowerCase() });
      if (!roleDoc) throw createHttpError(404, `Le rôle '${role}' est introuvable`);
      user.roleId = roleDoc._id;
    }

    await user.save();
    await user.populate({ path: "roleId", populate: { path: "permissionsIds", model: "Permission" } });

    return res.status(200).json({ message: "Rôle et permissions attribués avec succès !", data: user });
  } catch (error) { next(error); }
};
