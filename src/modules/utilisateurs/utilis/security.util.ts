import createHttpError from "http-errors";

export const verifierBlocageCompte = (user: any) => {
  if (user.bloqueJusquA && new Date() < new Date(user.bloqueJusquA)) {
    throw createHttpError(429, "Compte temporairement bloqué suite à trop de tentatives infructueuses. Réessayez plus tard.");
  }
};

export const gererEchecConnexion = async (user: any) => {
  user.tentativesEchouees = (user.tentativesEchouees || 0) + 1;
  if (user.tentativesEchouees >= 5) {
    user.bloqueJusquA = new Date(Date.now() + 15 * 60 * 1000); // Bloqué 15 minutes
  }
  await user.save();
};

export const reinitialiserTentatives = async (user: any) => {
  user.tentativesEchouees = 0;
  user.bloqueJusquA = null;
  user.derniereConnexion = new Date();
  await user.save();
};
