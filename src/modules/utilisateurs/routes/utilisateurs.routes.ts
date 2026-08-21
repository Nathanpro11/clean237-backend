import { Router } from "express";
import { registerController, loginController, resetPasswordRequestController } from "../controllers/auth.controller";
import { getUtilisateurByIdController, updateSelfController, changePasswordController, deleteUserController, listerUtilisateursController } from "../controllers/profil.controller";
import { updateRolePermissionsController, assignRoleByIdController, revokeRoleController } from "../controllers/role-permission.controller";
import { verifierPermission } from "../middlewares/rbac.middleware";
import { getDashboardStatsController, getHistoriquePersonnelController } from "../controllers/profil.controller";

const userRoutes = Router();

// 🔐 MODULE 1 : AUTHENTIFICATION
userRoutes.post("/create", registerController);
userRoutes.post("/login", loginController);
userRoutes.post("/reset-password-request", resetPasswordRequestController);

// 👤 MODULE 2 : GÉRER LE PROFIL
userRoutes.get("/list", listerUtilisateursController);
userRoutes.get("/get_All", listerUtilisateursController);
userRoutes.get("/get_by_id/:idUser", getUtilisateurByIdController);
userRoutes.put("/update_by_id/:idUser", verifierPermission("modifier_soi_meme"), updateSelfController);
userRoutes.put("/change-password/:idUser", verifierPermission("modifier_soi_meme"), changePasswordController);
userRoutes.delete("/delete_by_admin/:idUser", verifierPermission("supprimer_utilisateur"), deleteUserController);
userRoutes.delete("/delete_my_account/:idUser", verifierPermission("modifier_soi_meme"), deleteUserController);

// 🛡️ MODULE 3 : GÉRER RÔLES ET PERMISSIONS
userRoutes.put("/roles/modify-permissions/:idRole", verifierPermission("creer_role"), updateRolePermissionsController);
userRoutes.put("/roles/assign-to-user/:idUser", verifierPermission("creer_role"), assignRoleByIdController);
userRoutes.put("/roles/revoke-from-user/:idUser", verifierPermission("creer_role"), revokeRoleController);


// --- 📈 COUCHE COMPLÉMENTAIRE CAHIER DES CHARGES ---
userRoutes.get("/dashboard/stats/:idUser", verifierPermission("modifier_soi_meme"), getDashboardStatsController);
userRoutes.get("/historique/:idUser", verifierPermission("modifier_soi_meme"), getHistoriquePersonnelController);

export default userRoutes;
