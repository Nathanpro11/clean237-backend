import express from "express";

import {
  createReportController,
  getReportsController,
  getReportByIdController,
  updateReportController,
  deleteReportController,
  generateReportController,
} from "../controllers/rapport.controller";

const reportRoute = express.Router();

reportRoute.post("/", createReportController);
reportRoute.get("/", getReportsController);
reportRoute.get("/generate/:zoneId", generateReportController);
reportRoute.get("/:id", getReportByIdController);
reportRoute.put("/:id", updateReportController);
reportRoute.delete("/:id", deleteReportController);

export default reportRoute;
