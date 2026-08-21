import express from "express";
import {
  generateAnalyseController,
  getAnalysesController,
  getAnalyseByIdController,
  deleteAnalyseController,
} from "../controllers/analyse.controller";

const router = express.Router();

router.post("/generate", generateAnalyseController);
router.get("/", getAnalysesController);
router.get("/:id", getAnalyseByIdController);
router.delete("/:id", deleteAnalyseController);

export default router;

