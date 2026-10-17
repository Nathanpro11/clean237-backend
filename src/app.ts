import express from "express";
import type { Application, Request, Response } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import userRoutes from "./modules/utilisateurs/routes/utilisateurs.routes";
import { errorHand } from "./modules/utilisateurs/middlewares/error.middleware";
import { authenticate } from "./modules/utilisateurs/middlewares/auth.middleware";
import { verifierPermission } from "./modules/utilisateurs/middlewares/rbac.middleware";
import { initialiserProfilsEtPermissions } from "./config/init-db";
import { creerAdminParDefaut } from "./config/seed-admin";

import reportRoute from "./modules/administration/routes/rapport.routes";
import zoneProblemRoutes from "./modules/administration/routes/zoneProblematique.route";
import dashboardRoute from "./modules/administration/routes/dashboard.routes";
import donneeRoute from "./modules/administration/routes/donneeEnvironnementale.routes";
import analyseRoute from "./modules/administration/routes/analyse.routes";
import { errorHandler } from "./middlewares/errorHandler";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/clean237";

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Module utilisateurs : comptes, rôles, permissions (super admin)
app.use("/api/utilisateurs", userRoutes);

// Module administration : l'identité vient du module utilisateurs (JWT + permissions du rôle)
const adminOnly = [authenticate, verifierPermission("supprimer_utilisateur")];

app.use("/api/v1/dashboard", ...adminOnly, dashboardRoute);
app.use("/api/v1/donnees-environnementales", ...adminOnly, donneeRoute);
app.use("/api/v1/analyses", ...adminOnly, analyseRoute);
app.use("/api/v1/rapports", ...adminOnly, reportRoute);
// zoneProblemRoutes est monté sur /api/v1/ : on protège seulement son chemin
app.use("/api/v1/zones-problematiques", ...adminOnly);
app.use("/api/v1/", zoneProblemRoutes);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "Bienvenue sur l'API de Clean237 !" });
});

// Gestionnaires d'erreurs
app.use(errorHandler);
app.use(errorHand);

// Connexion et lancement
mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("✅ Connexion à MongoDB réussie avec succès !");
    try {
      await initialiserProfilsEtPermissions();
    } catch (e) {
      // Ignorer si déjà initialisé ou non requis
    }
    try {
      await creerAdminParDefaut();
    } catch (e) {
      console.error("❌ Seed administrateur :", e);
    }
    app.listen(PORT, () => {
      console.log(`🚀 [Clean237] Serveur démarré sur http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Erreur de connexion à la base de données :", error);
  });

export default app;