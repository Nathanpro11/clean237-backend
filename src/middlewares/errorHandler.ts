import type { ErrorRequestHandler } from "express";
import type { HttpError } from "http-errors";
import Joi from "joi";
import mongoose from "mongoose";

type ErrorWithStatus = Error & {
  status?: number;
  statusCode?: number;
  isJoi?: boolean;
  details?: Array<{ message: string }>;
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const error = err as ErrorWithStatus;

  console.error("Erreur serveur :", err);

  if (Joi.isError(err)) {
    return res.status(422).json({
      status: 422,
      message: error.details?.map((detail) => detail.message).join(", ") || "Validation invalide",
    });
  }

  if (err instanceof mongoose.Error.CastError) {
    return res.status(422).json({
      status: 422,
      message: "Identifiant invalide",
    });
  }

  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(422).json({
      status: 422,
      message: err.message,
    });
  }

  if (err instanceof SyntaxError && "body" in err && (err as SyntaxError & { status?: number }).status === 400) {
    return res.status(400).json({
      status: 400,
      message: "JSON invalide",
    });
  }

  const status = typeof err === "object" && err !== null && "status" in err ? Number((err as { status?: number }).status) || 500 : 500;

  if (status === 404 && typeof err === "object" && err !== null && "message" in err) {
    return res.status(404).json({
      status: 404,
      message: (err as { message: string }).message,
    });
  }

  if (status === 409 && typeof err === "object" && err !== null && "message" in err) {
    return res.status(409).json({
      status: 409,
      message: (err as { message: string }).message,
    });
  }

  if ((err as HttpError | undefined)?.statusCode) {
    return res.status((err as HttpError).statusCode).json({
      status: (err as HttpError).statusCode,
      message: (err as HttpError).message,
    });
  }

  return res.status(500).json({
    status: 500,
    message: "Erreur interne du serveur",
  });
};
