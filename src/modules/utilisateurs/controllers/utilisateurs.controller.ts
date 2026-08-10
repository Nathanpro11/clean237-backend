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
