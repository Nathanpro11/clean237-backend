// ================================================================
// Erreurs HTTP personnalisées pour le module Signalement
// ================================================================

export class AppError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// 404 - Ressource introuvable
export class NotFoundError extends AppError {
  constructor(message: string = 'Ressource introuvable') {
    super(message, 404);
  }
}

// 400 - Requête invalide (données manquantes ou incorrectes)
export class BadRequestError extends AppError {
  constructor(message: string = 'Requête invalide') {
    super(message, 400);
  }
}

// 409 - Conflit (ex: action impossible dans l'état actuel)
export class ConflictError extends AppError {
  constructor(message: string = 'Conflit détecté') {
    super(message, 409);
  }
}

// 500 - Erreur interne du serveur
export class InternalServerError extends AppError {
  constructor(message: string = 'Erreur interne du serveur') {
    super(message, 500);
  }
}