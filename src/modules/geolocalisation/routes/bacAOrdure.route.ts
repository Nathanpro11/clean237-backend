import { Router } from "express";
import { verifierPermission } from "../../utilisateurs/middlewares/rbac.middleware";
import * as c from "../controllers/bacAOrdure.controller";

// Montées derrière authenticate dans app.ts.
const bacRoutes = Router();
const admin = verifierPermission("supprimer_utilisateur");

bacRoutes.get("/", c.listerBacs);
bacRoutes.get("/proches", c.bacsProches);
bacRoutes.get("/:id", c.getBac);
bacRoutes.post("/", admin, c.creerBac);
bacRoutes.put("/:id", admin, c.modifierBac);
bacRoutes.delete("/:id", admin, c.supprimerBac);

export default bacRoutes;
