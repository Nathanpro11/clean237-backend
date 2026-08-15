import express from "express";
import { createZone, deleteZone, getAllZones, getZoneById, updateZone } from "../controllers/zone.controller.js";

const zoneRoutes = express.Router();

zoneRoutes.post("/create", createZone);
zoneRoutes.get("/get_all", getAllZones);
zoneRoutes.get("/get_by_id/:id", getZoneById);
zoneRoutes.put("/update_by_id/:id", updateZone);
zoneRoutes.delete("/delete_by_id/:id", deleteZone);

export default zoneRoutes;