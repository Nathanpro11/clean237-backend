import express from "express";

import {
    createZone,
    getZones,
    getZoneById,
    updateZone,
    deleteZone
} from "../controllers/zone.controller";

const zoneRoute = express.Router();

zoneRoute.post("/create", createZone);
zoneRoute.get("/get", getZones);
zoneRoute.get("/getzonebyid/:id", getZoneById);
zoneRoute.put("/updatezone/:id", updateZone);
zoneRoute.delete("/delete/:id", deleteZone);

export default zoneRoute;
