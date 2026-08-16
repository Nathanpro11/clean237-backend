import express from "express";
import { createBac, deleteBac, getAllBacs, getBacById, updateBac } from "../controllers/bacAOrdure.controller";

const bacAOrdureRoutes = express.Router();

bacAOrdureRoutes.post("/create", createBac);
bacAOrdureRoutes.get("/get_all", getAllBacs);
bacAOrdureRoutes.get("/get_by_id/:idBac", getBacById);
bacAOrdureRoutes.put("/update_by_id/:idBac", updateBac);
bacAOrdureRoutes.delete("/delete_by_id/:idBac", deleteBac);

export default bacAOrdureRoutes;