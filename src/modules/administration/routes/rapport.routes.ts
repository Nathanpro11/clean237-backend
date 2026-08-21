import express from "express";

import {
  generateReportController,
  getReportsController,
  getReportByIdController,
  deleteReportController,
  getReportPDFController,
} from "../controllers/rapport.controller";

const reportRoute = express.Router();

reportRoute.post("/generate", generateReportController);
reportRoute.get("/", getReportsController);
reportRoute.get("/:id", getReportByIdController);
reportRoute.get("/:id/pdf", getReportPDFController);
reportRoute.delete("/:id", deleteReportController);

export default reportRoute;


