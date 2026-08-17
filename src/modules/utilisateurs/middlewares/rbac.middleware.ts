import type { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import Role from "../models/role.model";

export const verifierPermission = (permissionRequise: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Récupération de l'ID du rôle (via les headers pour le test Postman, ou depuis le token JWT par la suite)
      const userRoleId = req.headers["x-role-id"];
      
      if (!userRoleId) {
        throw createHttpError(401, "Authentification requise : Veuillez fournir un x-role-id dans les headers.");
      }

      // Recherche du rôle et liaison (populate) avec ses permissions
      const roleComplet = await Role.findById(userRoleId).populate("permissionsIds");
      if (!roleComplet) {
        throw createHttpError(403, "Accès refusé : Rôle introuvable en base de données.");
      }

      // Vérification de la présence de la permission exigée dans le tableau
      const aLaPermission = (roleComplet.permissionsIds as any[]).some(
        (perm) => perm.nom === permissionRequise
      );

      if (!aLaPermission) {
        throw createHttpError(403, `Action interdite : Le rôle '${roleComplet.nom}' ne possède pas la permission [${permissionRequise}].`);
      }

      next(); // L'utilisateur est autorisé, on passe au contrôleur ou service suivant !
    } catch (error) {
      next(error);
    }
  };
};
