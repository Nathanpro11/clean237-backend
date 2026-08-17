import { Router } from "express";
import { 
  createUserConroller, 
  listerUtilisateursController,
  getUtilisateurByIdController,
  updateSelfController, 
  deleteUserByAdminController
} from "../controllers/utilisateurs.controller";
import { verifierPermission } from "../middlewares/rbac.middleware";

const userRoutes = Router();

// =========================================================================
// INTERFACE DE GESTION DES COMPTES (ADMIN, AGENT, CITOYEN)
// =========================================================================


userRoutes.post("/create", createUserConroller);

userRoutes.get("/list", listerUtilisateursController);
userRoutes.get("/get_All", listerUtilisateursController); // Reste actif pour compatibilité

userRoutes.get("/get_by_id/:idUser", getUtilisateurByIdController);

userRoutes.put("/update_by_id/:idUser", verifierPermission("modifier_soi_meme"), updateSelfController);
userRoutes.delete("/delete_by_admin/:idUser", verifierPermission("supprimer_utilisateur"), deleteUserByAdminController);
userRoutes.delete("/delete_my_account/:idUser", verifierPermission("modifier_soi_meme"), deleteUserByAdminController);

export default userRoutes;
