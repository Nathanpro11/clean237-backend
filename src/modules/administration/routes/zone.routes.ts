import express from "express";

import {
    createZone,
    getZones,
    getZoneById,
    updateZone,
    deleteZone,
    getZoneStatisticsController,
    getZoneAlertsController
} from "../controllers/zone.controller";

const zoneRoute = express.Router();

// New REST routes
zoneRoute.post("/", createZone);
zoneRoute.get("/", getZones);
zoneRoute.get("/:id", getZoneById);
zoneRoute.put("/:id", updateZone);
zoneRoute.delete("/:id", deleteZone);
zoneRoute.get("/:id/statistics", getZoneStatisticsController);
zoneRoute.get("/:id/alerts", getZoneAlertsController);

// Legacy routes for compatibility
zoneRoute.get("/get", getZones);
zoneRoute.get("/getzonebyid/:id", getZoneById);
zoneRoute.get("/getzonestatistics/:id", getZoneStatisticsController);

export default zoneRoute;
