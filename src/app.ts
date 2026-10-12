import express from "express";
import cors from "cors";
import createHttpError from "http-errors";
import type { Application, Request, Response } from "express";

import userRoutes from "./modules/utilisateurs/routes/utilisateurs.routes";
import reportRoute from "./modules/administration/routes/rapport.routes";
import dashboardRoute from "./modules/administration/routes/dashboard.routes";
import donneeRoute from "./modules/administration/routes/donneeEnvironnementale.routes";
import analyseRoute from "./modules/administration/routes/analyse.routes";
import zoneRoutes from "./modules/administration/routes/zone.routes";
import { errorHandler } from "./middlewares/errorHandler";

const app: Application = express();

app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({ message: "Bienvenue sur l'API de Clean237 !" });
});

app.use("/api/utilisateurs", userRoutes);
app.use("/api/v1/dashboard", dashboardRoute);
app.use("/api/v1/zones", zoneRoutes);
app.use("/api/v1/donnees-environnementales", donneeRoute);
app.use("/api/v1/analyses", analyseRoute);
app.use("/api/v1/rapports", reportRoute);

app.use((_req, _res, next) => {
  next(createHttpError(404, "Route introuvable"));
});

app.use(errorHandler);

export default app;
