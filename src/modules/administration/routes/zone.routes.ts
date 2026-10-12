import express from "express";

import { getZoneDetailsController, getZoneByIdController, getZonesController } from "../controllers/zone.controller";

const router = express.Router();

router.get("/", getZonesController);
router.get("/:id/details", getZoneDetailsController);
router.get("/:id", getZoneByIdController);

export default router;
