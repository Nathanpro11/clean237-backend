import express from "express";
import { getDashboardController } from "../controllers/dashboard.controller";

const dashboardRoute = express.Router();

dashboardRoute.get("/", getDashboardController);

export default dashboardRoute;
