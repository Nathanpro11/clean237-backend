import dotenv from "dotenv";
import mongoose from "mongoose";

import app from "./app";
import { initialiserProfilsEtPermissions } from "./config/init-db";
import { creerAdminParDefaut } from "./config/seed-admin";

dotenv.config();

const PORT = Number(process.env.PORT ?? 3000);
const MONGO_URI = process.env.MONGODB_URI ?? process.env.MONGO_URI ?? "mongodb://127.0.0.1:27017/clean237";

const startServer = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`✅ Connexion MongoDB réussie sur ${MONGO_URI}`);

    // Module utilisateurs : rôles, permissions et compte super admin par défaut
    try {
      await initialiserProfilsEtPermissions();
    } catch (error: unknown) {
      console.error("❌ Initialisation des rôles et permissions :", error instanceof Error ? error.message : error);
    }
    try {
      await creerAdminParDefaut();
    } catch (error: unknown) {
      console.error("❌ Seed administrateur :", error instanceof Error ? error.message : error);
    }

    app.listen(PORT, () => {
      console.log(`🚀 [Clean237] Serveur démarré sur http://localhost:${PORT}`);
    });
  } catch (error: unknown) {
    console.error("❌ Échec de connexion MongoDB :", error instanceof Error ? error.message : error);
    process.exit(1);
  }
};

startServer();