import type { NextFunction, Request, Response } from "express";
import Permission from "../models/permission.model";

export const createPermission = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const nouvellePermission = new Permission(req.body);
    await nouvellePermission.save();
    return res.status(201).json({ message: "Permission créée avec succès", data: nouvellePermission });
  } catch (error) {
    next(error);
  }
};

export const listerPermissions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const permissions = await Permission.find();
    return res.status(200).json(permissions);
  } catch (error) {
    next(error);
  }
};
