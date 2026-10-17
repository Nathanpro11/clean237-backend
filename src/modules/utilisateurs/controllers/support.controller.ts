import type { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import SupportMessage from "../models/support-message.model";
import { inscrireLogAction } from "../utilis/log.util";

// L'utilisateur connecté envoie un message au support : il est réellement enregistré en base.
export const envoyerMessageSupportController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== "string" || !message.trim()) {
      throw createHttpError(400, "Le message est requis.");
    }
    if (message.trim().length > 2000) {
      throw createHttpError(400, "Le message est trop long (2000 caractères maximum).");
    }

    const user = (req as any).user;
    const enregistre = await new SupportMessage({ utilisateurId: user._id, message: message.trim() }).save();
    await inscrireLogAction(user._id.toString(), "MESSAGE_SUPPORT", "Message envoyé au support", req);

    return res.status(201).json({ message: "Message envoyé au support.", data: enregistre });
  } catch (error) { next(error); }
};

// Réservé aux administrateurs : consultation des messages reçus.
export const listerMessagesSupportController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const messages = await SupportMessage.find()
      .sort({ createdAt: -1 })
      .limit(200)
      .populate("utilisateurId", "nom email");
    return res.status(200).json({ total: messages.length, data: messages });
  } catch (error) { next(error); }
};