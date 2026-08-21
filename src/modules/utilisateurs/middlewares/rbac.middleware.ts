import type { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import Role from "../models/role.model";

export const verifierPermission = (permissionRequise: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userRoleId = req.headers["x-role-id"];
      
      if (!userRoleId) {
        throw createHttpError(401, "Authentification requise : Veuillez fournir un x-role-id dans les headers.");
      }
      const roleComplet = await Role.findById(userRoleId).populate("permissionsIds");
      if (!roleComplet) {
        throw createHttpError(403, "Accès refusé : Rôle introuvable en base de données.");
      }

      const aLaPermission = (roleComplet.permissionsIds as any[]).some(
        (perm) => perm.nom === permissionRequise
      );

      if (!aLaPermission) {
        throw createHttpError(403, `Action interdite : Le rôle '${roleComplet.nom}' ne possède pas la permission [${permissionRequise}].`);
      }

      next(); 
    } catch (error) {
      next(error);
    }
  };
};
