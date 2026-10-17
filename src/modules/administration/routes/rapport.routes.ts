import express from "express";

import {
  deleteReportController,
  generateReportController,
  getReportByIdController,
  getReportExportController,
  getReportPDFController,
  getReportsController,
  updateReportStatusController,
} from "../controllers/rapport.controller";
import { validate } from "../utils/validate";
import { exportFormatValidation, idValidation, reportStatusValidation, reportValidation } from "../utils/validationSchemas";

const reportRoute = express.Router();

reportRoute.post("/generate", validate(reportValidation, "body"), generateReportController);
reportRoute.get("/", getReportsController);
reportRoute.get("/:id/export", validate(idValidation, "params"), validate(exportFormatValidation, "query"), getReportExportController);
reportRoute.get("/:id/pdf", validate(idValidation, "params"), getReportPDFController);
reportRoute.patch("/:id/statut", validate(idValidation, "params"), validate(reportStatusValidation, "body"), updateReportStatusController);
reportRoute.get("/:id", validate(idValidation, "params"), getReportByIdController);
reportRoute.delete("/:id", validate(idValidation, "params"), deleteReportController);

export default reportRoute;


