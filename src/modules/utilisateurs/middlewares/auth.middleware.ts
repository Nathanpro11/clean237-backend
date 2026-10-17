import type { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import jwt from "jsonwebtoken";
import Utilisateur from "../models/utilisateur.model";
import Role from "../models/role.model";

// Lecture paresseuse : dotenv.config() s'exécute après les imports dans app.ts
export const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET manquant dans le .env");
  return secret;
};

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) throw createHttpError(401, "Token manquant");

    const payload = jwt.verify(header.split(" ")[1], getJwtSecret()) as { idUser: string };
    const user = await Utilisateur.findOne({ _id: payload.idUser, estActif: true });
    if (!user) throw createHttpError(401, "Session invalide");

    (req as any).user = user;
    next();
  } catch (err: any) {
    next(err.status ? err : createHttpError(401, "Token invalide ou expiré"));
  }
};

// Autorise le propriétaire du compte ou un admin
export const soiMemeOuAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (String(user._id) === req.params.idUser) return next();

    const role = await Role.findById(user.roleId);
    if (role?.nom === "admin") return next();

    throw createHttpError(403, "Accès refusé : ce n'est pas votre compte");
  } catch (e) { next(e); }
};