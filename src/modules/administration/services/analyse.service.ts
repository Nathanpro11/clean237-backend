import createHttpError from "http-errors";
import AnalyseModel from "../models/analyse.model";
import DonneeModel from "../models/donneeEnvironnementale.model";
import rapportModel from "../models/rapport.model";
import { mockDonnees } from "../mocks/administration.mocks";

// Helper pour gérer la pagination et le tri dans les services
const parsePaginationAndSort = (query: any) => {
  const page = Math.max(1, parseInt(query.page as string) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(query.limit as string) || 10));
  const skip = (page - 1) * limit;

  const allowedSortFields = ["createdAt", "updatedAt", "type"];
  const sortField = allowedSortFields.includes(query.sort as string) ? (query.sort as string) : "createdAt";
  const sortOrder = query.order === "asc" ? 1 : -1;
  const sortOptions: Record<string, 1 | -1> = { [sortField]: sortOrder };

  return { page, limit, skip, sortOptions };
};

export const generateAnalyse = async (data: { type?: string; periode?: { start: Date; end: Date } }) => {
  // 1. Récupérer les données environnementales (depuis MongoDB ou via les mocks si vide)
  let donnees = await DonneeModel.find();
 
  if (!donnees || donnees.length === 0) {
    throw createHttpError(404, "Aucune donnée environnementale disponible pour générer l'analyse.");
  }

  // 2. Filtrer les données selon le type ou la période si fournis
  let filteredDonnees = donnees;
  const analyseType = data.type || "global_environment_analysis";

  if (data.periode && data.periode.start && data.periode.end) {
    const start = new Date(data.periode.start);
    const end = new Date(data.periode.end);
    filteredDonnees = donnees.filter((d: any) => {
      const dDate = new Date(d.date);
      return dDate >= start && dDate <= end;
    });
  }

  if (filteredDonnees.length === 0) {
    filteredDonnees = donnees; // Fallback si aucun filtre strict ne matche
  }

  // 3. Calculs et transformation métier
  const valeurs = filteredDonnees.map((d: any) => Number(d.valeur) || 0);
  const somme = valeurs.reduce((acc, v) => acc + v, 0);
  const moyenne = valeurs.length > 0 ? somme / valeurs.length : 0;
  const minimum = valeurs.length > 0 ? Math.min(...valeurs) : 0;
  const maximum = valeurs.length > 0 ? Math.max(...valeurs) : 0;
  const count = valeurs.length;

  const indicateurs = {
    totalPoints: count,
    moyenne: Number(moyenne.toFixed(2)),
    minimum,
    maximum,
    somme,
    unite: (filteredDonnees[0] as any)?.unite || "unit",
  };

  const resultat = `Analyse de type '${analyseType}' effectuée sur ${count} points de données. Moyenne observée : ${indicateurs.moyenne} ${indicateurs.unite}.`;

  // Récupérer les IDs valides des données présentes en base (ou stocker les objets / références)
  const donneesUtiliseesIds = filteredDonnees
    .filter((d: any) => d._id)
    .map((d: any) => d._id);

  // Si on utilise des mocks purs sans _id en base, on peut créer un enregistrement ou stocker leurs références si persistées
  // Pour l'exercice, si les données viennent des mocks, on s'assure qu'elles existent en base ou on les enregistre pour les lier proprement.
  for (const d of filteredDonnees) {
    if (!(d as any)._id) {
      const exists = await DonneeModel.findOne({ type: (d as any).type, valeur: (d as any).valeur, source: (d as any).source });
      if (!exists) {
        const newD = new DonneeModel(d);
        await newD.save();
        donneesUtiliseesIds.push(newD._id);
      } else {
        donneesUtiliseesIds.push(exists._id);
      }
    }
  }

  const periode = data.periode || {
    start: new Date(Math.min(...filteredDonnees.map((d: any) => new Date(d.date).getTime()))),
    end: new Date(Math.max(...filteredDonnees.map((d: any) => new Date(d.date).getTime()))),
  };

  const analyse = new AnalyseModel({
    type: analyseType,
    periode,
    resultat,
    indicateurs,
    donneesUtilisees: donneesUtiliseesIds,
  });

  await analyse.save();
  return analyse.populate("donneesUtilisees");
};

export const getAnalyses = async (queryParams: any) => {
  const { page, limit, skip, sortOptions } = parsePaginationAndSort(queryParams);

  const [analyses, total] = await Promise.all([
    AnalyseModel.find()
      .populate("donneesUtilisees")
      .sort(sortOptions)
      .skip(skip)
      .limit(limit),
    AnalyseModel.countDocuments(),
  ]);

  return {
    data: analyses,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

export const getAnalyseById = async (id: string) => {
  const analyse = await AnalyseModel.findById(id).populate("donneesUtilisees");
  if (!analyse) {
    throw createHttpError(404, "Analyse introuvable");
  }
  return analyse;
};

export const deleteAnalyse = async (id: string) => {
  const dependentRapport = await rapportModel.findOne({ analyseId: id });
  if (dependentRapport) {
    throw createHttpError(409, "Impossible de supprimer : un Rapport dépend de cette Analyse");
  }

  const analyse = await AnalyseModel.findByIdAndDelete(id);
  if (!analyse) {
    throw createHttpError(404, "Analyse introuvable");
  }
  return analyse;
};

