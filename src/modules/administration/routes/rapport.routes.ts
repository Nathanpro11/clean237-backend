import express from "express";

import {
  deleteReportController,
  generateReportController,
  getReportByIdController,
  getReportPDFController,
  getReportsController,
} from "../controllers/rapport.controller";
import { validate } from "../utils/validate";
import { idValidation, reportValidation } from "../utils/validationSchemas";

const reportRoute = express.Router();

reportRoute.post("/generate", validate(reportValidation, "body"), generateReportController);
reportRoute.get("/", getReportsController);
reportRoute.get("/:id/pdf", validate(idValidation, "params"), getReportPDFController);
reportRoute.get("/:id", validate(idValidation, "params"), getReportByIdController);
reportRoute.delete("/:id", validate(idValidation, "params"), deleteReportController);

export default reportRoute;


