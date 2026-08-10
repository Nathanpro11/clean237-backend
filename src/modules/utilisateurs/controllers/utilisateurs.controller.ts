import type { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import Utilisateur from "../models/utilisateur.model";
import Agent from "../models/agent.model";
import { InscriptionUtilisateurSchema, InscriptionAgentSchema } from "../validators/utilisateurs.validator";


export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
   
    const valideUser = await InscriptionUtilisateurSchema.validateAsync(req.body);

    
    const user = new Utilisateur(valideUser);
    await user.save();

    return res.status(201).json({ "message": "User created successfully" });
  } catch (error: any) {
    if (error.isJoi) {
      return next({
        status: 422,
        message: error.details.map((err: any) => err.message.replace(/"/g, ""))
      });
    }
    next(error);
  }
};


export const createAgent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    
    const valideAgent = await InscriptionAgentSchema.validateAsync(req.body);

    
    const agent = new Agent(valideAgent);
    await agent.save();

    return res.status(201).json({ "message": "Agent created successfully" });
  } catch (error: any) {
    if (error.isJoi) {
      return next({
        status: 422,
        message: error.details.map((err: any) => err.message.replace(/"/g, ""))
      });
    }
    next(error);
  }
};


export const getAllUser = async (req: Request, res: Response) => {
  try {
    
    const users = await Utilisateur.find().populate("roleId");
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json(error);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await Utilisateur.findById(req.params.idUser).populate("roleId");
    if (!user) {
      throw createHttpError(404, "Utilisateur non trouvé");
    }
    return res.status(200).json(user);
  } catch (error: any) {
    next(error);
  }
};


import { ModificationUtilisateurSchema } from "../validators/utilisateurs.validator";


export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
   
    const valideUser = await ModificationUtilisateurSchema.validateAsync(req.body);
    
   
    const user = await Utilisateur.findByIdAndUpdate(req.params.idUser, valideUser, { new: true });
    if (!user) {
      throw createHttpError(404, "Utilisateur non trouvé");
    }
    
    return res.status(202).json({ "message": "user updated successfully!" });
  } catch (error: any) {
    if (error.isJoi) {
      return next({
        status: 422,
        message: error.details.map((err: any) => err.message.replace(/"/g, ""))
      });
    }
    next(error);
  }
};


export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await Utilisateur.findByIdAndDelete(req.params.idUser);
    if (!user) {
      throw createHttpError(404, "Utilisateur non trouvé");
    }
    
    return res.status(202).json({ "message": "user delete successfully!" });
  } catch (error) {
    next(error);
  }
};

