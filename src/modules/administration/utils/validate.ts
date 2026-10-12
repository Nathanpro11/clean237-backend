import type { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import Joi from "joi";

export type ValidationTarget = "body" | "params" | "query";

export const validate = (
  schema: Joi.Schema,
  target: ValidationTarget
) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const value = await schema.validateAsync(req[target], {
        abortEarly: false,
        convert: true,
      });
      req[target] = value;
      next();
    } catch (error: unknown) {
      if (Joi.isError(error)) {
        const messages = error.details.map((detail) => detail.message).join(", ");
        next(createHttpError(422, messages));
        return;
      }
      next(error);
    }
  };
};
