import express from "express";
import type { Application, Request, Response } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoutes from "./modules/utilisateurs/routes/utilisateurs.routes";
import { errorHand } from "./modules/utilisateurs/middlewares/error.middleware";
import { initialiserProfilsEtPermissions } from "./config/init-db";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/clean237";

// ✅ 1. PARSEUR DE BODY CONFIGURÉ AVANT TOUTES LES ROUTES
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ 2. ROUTES DE L'APPLICATION
app.use("/api/utilisateurs", userRoutes);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "Bienvenue sur l'API de Clean237 !" });
});

// ✅ 3. INTERCEPTEUR DE FIN
app.use(errorHand);

// ✅ 4. CONNEXION ET LANCEMENT UNIQUE
mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log("Connexion à MongoDB réussie avec succès !");
    await initialiserProfilsEtPermissions();
    app.listen(PORT, () => {
      console.log(`⚡ [Clean237] Serveur en écoute sur http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Erreur de connexion à la base de données :", error);
  });

export default app;
