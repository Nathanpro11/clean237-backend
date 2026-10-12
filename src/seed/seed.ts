import fs from "node:fs/promises";
import path from "node:path";
import dotenv from "dotenv";
import mongoose from "mongoose";

import AnalyseModel from "../modules/administration/models/analyse.model";
import DonneeModel from "../modules/administration/models/donneeEnvironnementale.model";
import RapportModel from "../modules/administration/models/rapport.model";
import ZoneModel from "../modules/administration/models/zone.model";

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI ?? process.env.MONGO_URI ?? "mongodb://127.0.0.1:27017/clean237";
const resetAll = process.argv.includes("--reset-all");

const zoneDefinitions = [
  { nom: "Mfoundi Centre", alertTarget: 8 },
  { nom: "Biyem-Assi", alertTarget: 6 },
  { nom: "Bastos", alertTarget: 3 },
  { nom: "Mokolo Marché", alertTarget: 1 },
];

const types = ["alerte", "temperature", "humidity", "taux_remplissage"] as const;

const buildDonnee = (zoneId: string, index: number, zoneConfig: { nom: string; alertTarget: number }, dayOffset: number) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - dayOffset));
  date.setHours((index * 3) % 24, (index * 7) % 60, 0, 0);

  const type = types[index % types.length];
  const baseValue = {
    alerte: zoneConfig.alertTarget > 0 && index % Math.max(3, 10 - zoneConfig.alertTarget) === 0 ? 1 : 0,
    temperature: 24 + ((index * 7) % 10),
    humidity: 55 + ((index * 11) % 30),
    taux_remplissage: 30 + ((index * 17) % 60),
  }[type];

  return {
    zoneId,
    type,
    valeur: baseValue,
    unite: type === "temperature" ? "°C" : type === "humidity" ? "%" : type === "taux_remplissage" ? "%" : "",
    date,
    source: "seed",
    description: `${zoneConfig.nom} — ${type}`,
  };
};

const main = async (): Promise<void> => {
  await mongoose.connect(MONGO_URI);

  if (resetAll) {
    await Promise.all([
      AnalyseModel.deleteMany({}),
      RapportModel.deleteMany({}),
      DonneeModel.deleteMany({}),
      ZoneModel.deleteMany({}),
    ]);
  } else {
    await Promise.all([
      DonneeModel.deleteMany({}),
      ZoneModel.deleteMany({}),
    ]);
  }

  const createdZones = await ZoneModel.insertMany(zoneDefinitions.map((zone) => ({ nom: zone.nom })));
  const createdData: Array<Record<string, unknown>> = [];

  for (const zone of createdZones) {
    const zoneConfig = zoneDefinitions.find((entry) => entry.nom === zone.nom) ?? { nom: zone.nom, alertTarget: 1 };
    for (let dayOffset = 0; dayOffset < 30; dayOffset += 1) {
      const perDay = (zoneDefinitions.indexOf(zoneConfig) + 1) * 2;
      for (let point = 0; point < perDay; point += 1) {
        createdData.push(buildDonnee(zone._id.toString(), dayOffset * 3 + point, zoneConfig, dayOffset));
      }
    }
  }

  for (let idx = 0; idx < createdData.length; idx += 1) {
    if (idx % 10 === 0) {
      const target = zoneDefinitions[(idx / 10) % zoneDefinitions.length];
      createdData[idx] = {
        ...createdData[idx],
        type: "alerte",
        valeur: 1,
        description: `${target.nom} — alerte de vigilance`,
      };
    }
  }

  await DonneeModel.insertMany(createdData);

  const tmpDir = path.resolve(process.cwd(), "tmp");
  await fs.mkdir(tmpDir, { recursive: true });

  console.log(`✅ Données seedées (${createdZones.length} zones, ${createdData.length} points).`);
  await mongoose.disconnect();
};

main().catch((error: unknown) => {
  console.error("Erreur de seed :", error);
  process.exit(1);
});
