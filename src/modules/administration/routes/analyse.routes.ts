import express from "express";

import {
  generateAnalyseController,
  getAnalyseByIdController,
  getAnalysesController,
  deleteAnalyseController,
} from "../controllers/analyse.controller";
import { validate } from "../utils/validate";
import { analyseValidation, idValidation } from "../utils/validationSchemas";

const router = express.Router();

router.post("/generate", validate(analyseValidation, "body"), generateAnalyseController);
router.get("/", getAnalysesController);
router.get("/:id", validate(idValidation, "params"), getAnalyseByIdController);
router.delete("/:id", validate(idValidation, "params"), deleteAnalyseController);

export default router;

