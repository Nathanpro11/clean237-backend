import { Router } from "express";
import { registerController, loginController } from "../controllers/auth.controller";
import { googleLoginController } from "../controllers/google-auth.controller";
import { demanderCodeReinitialisationController, confirmerReinitialisationController } from "../controllers/reset-password.controller";
import {
  getMeController, getUtilisateurByIdController, updateSelfController, changePasswordController,
  deleteUserController, listerUtilisateursController, rechercheGlobaleController,
  getHistoriquePersonnelController,
} from "../controllers/profil.controller";
import { getDashboardStatsController } from "../controllers/dashboard-stats.controller";
import { envoyerMessageSupportController, listerMessagesSupportController } from "../controllers/support.controller";
import { updateRolePermissionsController, assignRoleByIdController, revokeRoleController } from "../controllers/role-permission.controller";
import { creerParAdminController, changerStatutController } from "../controllers/admin-users.controller";
import { verifierPermission } from "../middlewares/rbac.middleware";
import { authenticate, soiMemeOuAdmin } from "../middlewares/auth.middleware";


const userRoutes = Router();

// MODULE 1 : AUTHENTIFICATION (public)
userRoutes.post("/create", registerController);
userRoutes.post("/login", loginController);
userRoutes.post("/google", googleLoginController);
// Mot de passe oublié : 1) demande du code par e-mail, 2) code + nouveau mot de passe
userRoutes.post("/reset-password-request", demanderCodeReinitialisationController);
userRoutes.post("/reset-password-confirm", confirmerReinitialisationController);

// MODULE 2 : PROFIL
userRoutes.get("/me", authenticate, getMeController);

// Liste et recherche : réservées aux admins
userRoutes.get("/list", authenticate, verifierPermission("supprimer_utilisateur"), listerUtilisateursController);
userRoutes.get("/get_All", authenticate, verifierPermission("supprimer_utilisateur"), listerUtilisateursController);
userRoutes.get("/recherche", authenticate, verifierPermission("supprimer_utilisateur"), rechercheGlobaleController);


userRoutes.post("/support", authenticate, envoyerMessageSupportController);
userRoutes.get("/support", authenticate, verifierPermission("supprimer_utilisateur"), listerMessagesSupportController);
userRoutes.get("/get_by_id/:idUser", authenticate, soiMemeOuAdmin, getUtilisateurByIdController);
userRoutes.put("/update_by_id/:idUser", authenticate, soiMemeOuAdmin, verifierPermission("modifier_soi_meme"), updateSelfController);
userRoutes.put("/change-password/:idUser", authenticate, soiMemeOuAdmin, verifierPermission("modifier_soi_meme"), changePasswordController);
userRoutes.delete("/delete_by_admin/:idUser", authenticate, verifierPermission("supprimer_utilisateur"), deleteUserController);
userRoutes.delete("/delete_my_account/:idUser", authenticate, soiMemeOuAdmin, verifierPermission("modifier_soi_meme"), deleteUserController);

// ADMINISTRATION DES COMPTES
userRoutes.post("/admin/create", authenticate, verifierPermission("creer_role"), creerParAdminController);
userRoutes.put("/admin/statut/:idUser", authenticate, verifierPermission("supprimer_utilisateur"), changerStatutController);

// MODULE 3 : RÔLES ET PERMISSIONS
userRoutes.put("/roles/modify-permissions/:idRole", authenticate, verifierPermission("creer_role"), updateRolePermissionsController);
userRoutes.put("/roles/assign-to-user/:idUser", authenticate, verifierPermission("creer_role"), assignRoleByIdController);
userRoutes.put("/roles/revoke-from-user/:idUser", authenticate, verifierPermission("creer_role"), revokeRoleController);

userRoutes.get("/dashboard/stats/:idUser", authenticate, soiMemeOuAdmin, verifierPermission("modifier_soi_meme"), getDashboardStatsController);
userRoutes.get("/historique/:idUser", authenticate, soiMemeOuAdmin, verifierPermission("modifier_soi_meme"), getHistoriquePersonnelController);

export default userRoutes;