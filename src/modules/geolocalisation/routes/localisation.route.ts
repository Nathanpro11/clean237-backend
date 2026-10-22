import { Router } from "express";
import * as c from "../controllers/localisation.controller";

const localisationRoutes = Router();
localisationRoutes.post("/", c.creerLocalisation);
localisationRoutes.get("/", c.mesLocalisations);
localisationRoutes.delete("/:id", c.supprimerLocalisation);

export default localisationRoutes;
