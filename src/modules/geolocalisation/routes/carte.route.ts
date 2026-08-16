import express from "express";
import { getCarteData } from "../controllers/carte.controller.js";

const carteRoutes = express.Router();

carteRoutes.get("/get_carte", getCarteData);

export default carteRoutes;