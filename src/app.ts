import express from "express";
import type { Application, Request, Response } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoutes from "./modules/utilisateurs/routes/utilisateurs.routes";
import { errorHand } from "./modules/utilisateurs/middlewares/error.middleware"; // Ajustez le chemin selon votre structure si nécessaire
import { initialiserProfilsEtPermissions } from "./config/init-db";

// Charger les variables d'environnement du fichier .env
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/clean237";

// Middleware pour analyser le format JSON dans les requêtes (ex: Postman)
app.use(express.json());

// --- ROUTES DE L'APPLICATION ---
// Toutes nos routes utilisateurs commenceront par /api/utilisateurs
app.use("/api/utilisateurs", userRoutes);

// Route de test de santé du serveur
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "Bienvenue sur l'API de Clean237 !" });
});

// --- GESTION GLOBALE DES ERREURS (En tout dernier après les routes) ---
app.use(errorHand);

// --- CONNEXION MONGODB & DÉMARRAGE DU SERVEUR ---
mongoose.connect(MONGO_URI)
  .then(async() => {
    console.log("Connexion à MongoDB réussie avec succès !");

    await  initialiserProfilsEtPermissions();
    app.listen(PORT, () => {
      console.log(`Serveur en écoute sur http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Erreur de connexion à la base de données :", error);
  });

export default app;
