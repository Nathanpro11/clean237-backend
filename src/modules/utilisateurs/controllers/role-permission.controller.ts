import type { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import Role from "../models/role.model";
import Utilisateur from "../models/utilisateur.model";


export const updateRolePermissionsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { permissionsIds } = req.body;
    const role = await Role.findByIdAndUpdate(req.params.idRole, { permissionsIds }, { new: true });
    if (!role) throw createHttpError(404, "Rôle introuvable");
    return res.status(200).json({ message: "Permissions du rôle modifiées avec succès", data: role });
  } catch (error) { next(error); }
};


export const assignRoleByIdController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.body;
    const user = await Utilisateur.findById(req.params.idUser);
    if (!user) throw createHttpError(404, "Utilisateur introuvable");

    const roleDoc = await Role.findOne({ nom: role.toLowerCase() });
    if (!roleDoc) throw createHttpError(404, `Le rôle '${role}' est introuvable`);

    user.roleId = roleDoc._id;
    await user.save();
    await user.populate({ path: "roleId", populate: { path: "permissionsIds", model: "Permission" } });

    return res.status(200).json({ message: "Rôle et permissions attribués avec succès !", data: user });
  } catch (error) { next(error); }
};


export const revokeRoleController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await Utilisateur.findByIdAndUpdate(req.params.idUser, { roleId: null }, { new: true });
    if (!user) throw createHttpError(404, "Utilisateur introuvable");
    return res.status(200).json({ message: "Rôle révoqué avec succès", data: user });
  } catch (error) { next(error); }
};
