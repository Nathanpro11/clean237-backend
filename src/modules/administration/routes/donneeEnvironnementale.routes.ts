import express from "express";
import {
  getDonneesController,
  getDonneeByIdController,
} from "../controllers/donneeEnvironnementale.controller";

const router = express.Router();

router.get("/", getDonneesController);
router.get("/:id", getDonneeByIdController);

export default router;

