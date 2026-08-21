import express from "express";
import { getDashboardController, getProblematicZonesController } from "../controllers/dashboard.controller";

const dashboardRoute = express.Router();

dashboardRoute.get("/", getDashboardController);
dashboardRoute.get("/zones/problematic", getProblematicZonesController);

export default dashboardRoute;

