import type { NextFunction, Request, Response } from "express";
import Role from "../models/role.model";

export const createRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const nouveauRole = new Role(req.body);
    await nouveauRole.save();
    return res.status(201).json({ message: "Rôle créé avec succès", data: nouveauRole });
  } catch (error) {
    next(error);
  }
};

export const listerRoles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const roles = await Role.find().populate("permissionsIds");
    return res.status(200).json(roles);
  } catch (error) {
    next(error);
  }
};
