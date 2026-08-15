import express from "express";
import {getPositionActuelle, createLocalisation, getHistoriquePositions, deleteLocalisation} from "../controllers/localisation.controller.js";

const localisationRoutes = express.Router();

localisationRoutes.post("/position_actuelle", getPositionActuelle);
localisationRoutes.post("/create", createLocalisation);
localisationRoutes.get("/get_historique", getHistoriquePositions);
localisationRoutes.delete("/delete_by_id/:id", deleteLocalisation);

export default localisationRoutes;