import express from "express";

import {
  getAlerteByIdController,
  getAlertesController,
  traiterAlerteController,
} from "../controllers/alerte.controller";

const router = express.Router();

router.get("/", getAlertesController);
router.get("/:id", getAlerteByIdController);
router.patch("/:id/traiter", traiterAlerteController);

export default router;
