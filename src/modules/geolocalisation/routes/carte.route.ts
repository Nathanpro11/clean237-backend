import { Router } from "express";
import { carte } from "../controllers/carte.controller";

const carteRoutes = Router();
carteRoutes.get("/", carte);

export default carteRoutes;
