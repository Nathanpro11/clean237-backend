import createHttpError from "http-errors";
import DonneeModel from "../models/donneeEnvironnementale.model";
import { mockDonnees } from "../mocks/administration.mocks";

export const getDonnees = async () => {
  // Récupération des données environnementales (provenant de la base ou des mocks si vide en dev)
  const donnees = await DonneeModel.find();
  
  return donnees;
};

export const getDonneeById = async (id: string) => {
  // Recherche par ID dans la base MongoDB
  const donnee = await DonneeModel.findById(id);
  if (!donnee) {
    // Fallback recherche dans les mocks si non trouvé en base (utile pour le développement)
    const mockFound = mockDonnees.find((item: any) => item._id === id || (item as any).id === id);
    if (!mockFound) {
      throw createHttpError(404, "Donnée environnementale introuvable");
    }
    return mockFound;
  }
  return donnee;
};

