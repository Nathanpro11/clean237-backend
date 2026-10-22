import "dotenv/config";
import express from "express";
import cors from "cors";
import createHttpError from "http-errors";
import type { Application, Request, Response } from "express";

import userRoutes from "./modules/utilisateurs/routes/utilisateurs.routes";
import { errorHand } from "./modules/utilisateurs/middlewares/error.middleware";
import { authenticate } from "./modules/utilisateurs/middlewares/auth.middleware";
import { verifierPermission } from "./modules/utilisateurs/middlewares/rbac.middleware";

import reportRoute from "./modules/administration/routes/rapport.routes";
import dashboardRoute from "./modules/administration/routes/dashboard.routes";
import donneeRoute from "./modules/administration/routes/donneeEnvironnementale.routes";
import analyseRoute from "./modules/administration/routes/analyse.routes";
import zoneRoutes from "./modules/administration/routes/zone.routes";
import alerteRoutes from "./modules/administration/routes/alerte.routes";
import { signalementRoutes, notificationRoutes } from "./modules/notifications-signalements/signalement.routes";
import bacRoutes from "./modules/geolocalisation/routes/bacAOrdure.route";
import carteRoutes from "./modules/geolocalisation/routes/carte.route";
import localisationRoutes from "./modules/geolocalisation/routes/localisation.route";
import { errorHandler } from "./middlewares/errorHandler";

const app: Application = express();

app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({ message: "Bienvenue sur l'API de Clean237 !" });
});

// Module utilisateurs : comptes, rôles, permissions (super admin)
app.use("/api/utilisateurs", userRoutes);

// Module administration : l'identité vient du module utilisateurs (JWT + permissions du rôle)
const adminOnly = [authenticate, verifierPermission("supprimer_utilisateur")];

app.use("/api/v1/dashboard", ...adminOnly, dashboardRoute);
app.use("/api/v1/zones", ...adminOnly, zoneRoutes);
app.use("/api/v1/alertes", ...adminOnly, alerteRoutes);
app.use("/api/v1/donnees-environnementales", ...adminOnly, donneeRoute);
app.use("/api/v1/analyses", ...adminOnly, analyseRoute);
app.use("/api/v1/rapports", ...adminOnly, reportRoute);
// Module signalements et notifications : tout utilisateur connecté, droits vérifiés par route
app.use("/api/v1/signalements", authenticate, signalementRoutes);
app.use("/api/v1/notifications", authenticate, notificationRoutes);
// Module géolocalisation : lecture pour tout utilisateur connecté, écriture des bacs réservée à l'admin
app.use("/api/v1/bacs", authenticate, bacRoutes);
app.use("/api/v1/carte", authenticate, carteRoutes);
app.use("/api/v1/localisations", authenticate, localisationRoutes);

app.use((_req, _res, next) => {
  next(createHttpError(404, "Route introuvable"));
});

app.use(errorHandler);
app.use(errorHand);

export default app;
