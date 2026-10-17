import express from "express";

import {
  getDonneeByIdController,
  getDonneesController,
} from "../controllers/donneeEnvironnementale.controller";
import { validate } from "../utils/validate";
import { donneeQueryValidation, idValidation } from "../utils/validationSchemas";

const router = express.Router();

router.get("/", validate(donneeQueryValidation, "query"), getDonneesController);
router.get("/:id", validate(idValidation, "params"), getDonneeByIdController);

export default router;

