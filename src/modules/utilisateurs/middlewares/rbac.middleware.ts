import type { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import Role from "../models/role.model";

export const verifierPermission = (permissionRequise: string) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      if (!user) throw createHttpError(401, "Authentification requise");

      const role = await Role.findById(user.roleId).populate("permissionsIds");
      if (!role) throw createHttpError(403, "Accès refusé : rôle introuvable");

      const ok = (role.permissionsIds as any[]).some((p) => p.nom === permissionRequise);
      if (!ok) throw createHttpError(403, `Le rôle '${role.nom}' n'a pas la permission [${permissionRequise}]`);

      next();
    } catch (error) { next(error); }
  };