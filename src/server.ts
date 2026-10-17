import dotenv from "dotenv";
import mongoose from "mongoose";

import app from "./app";

dotenv.config();

const PORT = Number(process.env.PORT ?? 3000);
const MONGO_URI = process.env.MONGODB_URI ?? process.env.MONGO_URI ?? "mongodb://127.0.0.1:27017/clean237";

const startServer = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`✅ Connexion MongoDB réussie sur ${MONGO_URI}`);
    app.listen(PORT, () => {
      console.log(`🚀 [Clean237] Serveur démarré sur http://localhost:${PORT}`);
    });
  } catch (error: unknown) {
    console.error("❌ Échec de connexion MongoDB :", error instanceof Error ? error.message : error);
    process.exit(1);
  }
};

startServer();
