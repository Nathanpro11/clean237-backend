import express from "express";

import {
   
    getZones,
    getZoneById,
    
    getZoneStatisticsController,
    getZoneAlertsController
} from "../controllers/zone.controller";

const zoneRoute = express.Router();

// New REST routes
zoneRoute.get("/", getZones);
zoneRoute.get("/:id", getZoneById);
zoneRoute.get("/:id/statistics", getZoneStatisticsController);
zoneRoute.get("/:id/alerts", getZoneAlertsController);


export default zoneRoute;
