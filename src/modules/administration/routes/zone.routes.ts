import express from "express";

import { getZonesController, getZoneByIdController } from "../controllers/zone.controller";

const router = express.Router();

router.get("/", getZonesController);
router.get("/:id", getZoneByIdController);

export default router;
