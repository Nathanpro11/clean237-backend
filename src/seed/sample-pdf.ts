import fs from "node:fs/promises";
import path from "node:path";
import dotenv from "dotenv";
import mongoose from "mongoose";

import AnalyseModel from "../modules/administration/models/analyse.model";
import DonneeModel from "../modules/administration/models/donneeEnvironnementale.model";
import RapportModel from "../modules/administration/models/rapport.model";
import ZoneModel from "../modules/administration/models/zone.model";
import { generateReportPDF } from "../modules/administration/services/rapport.service";

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI ?? process.env.MONGO_URI ?? "mongodb://127.0.0.1:27017/clean237";

const buildIndicators = (data: Array<{ type: string; valeur: number; unite?: string | null }>) => {
  const grouped = new Map<string, { count: number; sum: number; min: number; max: number; unite?: string }>();

  for (const entry of data) {
    const key = entry.type;
    const current: { count: number; sum: number; min: number; max: number; unite?: string } = grouped.get(key) ?? {
      count: 0,
      sum: 0,
      min: Number.POSITIVE_INFINITY,
      max: Number.NEGATIVE_INFINITY,
      unite: entry.unite ?? undefined,
    };
    current.count += 1;
    current.sum += Number(entry.valeur) || 0;
    current.min = Math.min(current.min, Number(entry.valeur) || 0);
    current.max = Math.max(current.max, Number(entry.valeur) || 0);
    if (entry.unite) current.unite = entry.unite;
    grouped.set(key, current);
  }

  const parType: Record<string, { count: number; moyenne: number; minimum: number; maximum: number; somme: number; unite?: string }> = {};
  for (const [type, metrics] of grouped.entries()) {
    parType[type] = {
      count: metrics.count,
      moyenne: Number((metrics.sum / metrics.count).toFixed(2)),
      minimum: Number(metrics.min.toFixed(2)),
      maximum: Number(metrics.max.toFixed(2)),
      somme: Number(metrics.sum.toFixed(2)),
      unite: metrics.unite,
    };
  }

  return {
    totalPoints: data.length,
    parType,
  };
};

const main = async (): Promise<void> => {
  await mongoose.connect(MONGO_URI);

  const zones = await ZoneModel.find();
  if (!zones.length) {
    throw new Error("Aucune zone trouvée. Lancez npm run seed avant pdf:sample.");
  }

  const sampleData = await DonneeModel.find({ zoneId: zones[0]._id }).sort({ date: 1 }).limit(20);
  if (!sampleData.length) {
    throw new Error("Aucune donnée pour le PDF d’exemple.");
  }

  const analyse = await AnalyseModel.create({
    type: "global_environment_analysis",
    periode: {
      start: new Date(sampleData[0].date),
      end: new Date(sampleData[sampleData.length - 1].date),
    },
    resultat: "Suivi environnemental stable avec légère hausse de la température moyenne sur la période.",
    indicateurs: buildIndicators(sampleData.map((item) => ({ type: item.type, valeur: item.valeur, unite: item.unite }))),
    donneesUtilisees: sampleData.map((item) => item._id),
  });

  const report = await RapportModel.create({
    titre: "Rapport de suivi environnemental - Mfoundi Centre",
    description: "Synthèse mensuelle de la qualité environnementale du quartier avec indicateurs de température, humidité et taux de remplissage.",
    analyseId: analyse._id,
    statistiques: analyse.indicateurs,
  });

  const pdf = await generateReportPDF(report._id.toString());
  const outputDir = path.resolve(process.cwd(), "tmp");
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(path.join(outputDir, "sample-rapport.pdf"), Buffer.from(pdf.pdfBytes));

  const extraData = await DonneeModel.find({}).sort({ date: 1 }).limit(40);
  const longAnalyse = await AnalyseModel.create({
    type: "global_environment_analysis",
    periode: {
      start: new Date(extraData[0].date),
      end: new Date(extraData[extraData.length - 1].date),
    },
    resultat: "Période plus dense et plus variable, avec plusieurs types de données observés sur la même zone.",
    indicateurs: buildIndicators(extraData.map((item) => ({ type: item.type, valeur: item.valeur, unite: item.unite }))),
    donneesUtilisees: extraData.map((item) => item._id),
  });

  const longReport = await RapportModel.create({
    titre: "Rapport environnemental long - Vérification multi-page et répétition de tableau",
    description: "Ce document long vérifie les sauts de page, la répétition d’en-tête du tableau et le rendu de la mise en page sur plusieurs pages.",
    analyseId: longAnalyse._id,
    statistiques: longAnalyse.indicateurs,
  });

  const longPdf = await generateReportPDF(longReport._id.toString());
  await fs.writeFile(path.join(outputDir, "sample-rapport-long.pdf"), Buffer.from(longPdf.pdfBytes));

  console.log(`✅ PDFs générés dans ${outputDir}`);
  await mongoose.disconnect();
};

main().catch((error: unknown) => {
  console.error("Erreur de génération PDF :", error);
  process.exit(1);
});
