import express from "express";

import {
    createZone,
    getZones,
    getZoneById,
    getZoneStatisticsController
} from "../controllers/zone.controller";

const zoneRoute = express.Router();

zoneRoute.get("/get", getZones);
zoneRoute.get("/getzonebyid/:id", getZoneById);
zoneRoute.get("/getzonestatistics/:id", getZoneStatisticsController);

export default zoneRoute;
