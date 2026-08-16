import type { Request, Response, NextFunction } from "express";
import { getDashboardStatistics } from "../services/dashboard.service";

export const getDashboardController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const stats = await getDashboardStatistics();
    return res.status(200).json({
      message: "Statistiques du tableau de bord récupérées avec succès",
      dashboard: stats,
    });
  } catch (error: unknown) {
    return next(error);
  }
};
