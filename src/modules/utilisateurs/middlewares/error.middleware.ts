import type { Request, Response, NextFunction } from "express";

export const errorHand = (err: any, req: Request, res: Response, next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  
  const message = Array.isArray(err.message) 
    ? err.message.join(", ") 
    : err.message || "Une erreur interne est survenue";

  return res.status(status).json({
    status: status,
    message: message
  });
};
