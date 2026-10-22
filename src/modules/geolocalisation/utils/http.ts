import type { NextFunction, Request, RequestHandler, Response } from "express";
import createHttpError from "http-errors";
import type { ObjectSchema } from "joi";

export const gerer =
  (fn: (req: Request, res: Response) => Promise<unknown>): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    fn(req, res).catch(next);
  };

export const valider = async <T = any>(schema: ObjectSchema, corps: unknown): Promise<T> => {
  try {
    return await schema.validateAsync(corps, { abortEarly: false, stripUnknown: true });
  } catch (error: any) {
    if (error.isJoi) {
      throw createHttpError(
        422,
        error.details.map((d: any) => String(d.message).replace(/"/g, "")).join(", ")
      );
    }
    throw error;
  }
};

export const idUtilisateur = (req: Request): string => {
  const u = (req as any).user ?? {};
  return String(u.idUser ?? u._id ?? u.id ?? "");
};
