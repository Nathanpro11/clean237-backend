import { Router } from "express";
import { verifierPermission } from "../utilisateurs/middlewares/rbac.middleware";
import * as c from "./signalement.controller";

// Montées derrière authenticate dans app.ts.
export const signalementRoutes = Router();

// Citoyen
signalementRoutes.post("/", verifierPermission("creer_signalement"), c.creer);
signalementRoutes.get("/mes-signalements", verifierPermission("creer_signalement"), c.mesSignalements);
signalementRoutes.get("/mes-statistiques", verifierPermission("creer_signalement"), c.mesStatistiques);

// Agent de collecte
signalementRoutes.get("/a-traiter", verifierPermission("collecter_sallete"), c.aTraiter);
signalementRoutes.get("/historique-agent", verifierPermission("collecter_sallete"), c.historiqueAgent);

// Admin
signalementRoutes.get("/", verifierPermission("supprimer_utilisateur"), c.lister);
signalementRoutes.delete("/:id", verifierPermission("supprimer_utilisateur"), c.supprimer);

// Par signalement (propriété ou assignation vérifiée dans le service)
signalementRoutes.get("/:id", c.getParId);
signalementRoutes.put("/:id", verifierPermission("creer_signalement"), c.mettreAJour);
signalementRoutes.patch("/:id/annuler", verifierPermission("creer_signalement"), c.annuler);
signalementRoutes.patch("/:id/statut", c.changerStatut);
signalementRoutes.patch("/:id/archiver", c.archiver);

export const notificationRoutes = Router();
notificationRoutes.get("/", c.listerNotifications);
notificationRoutes.patch("/toutes-lues", c.marquerToutesLues);
notificationRoutes.patch("/:id/lu", c.marquerLue);
notificationRoutes.delete("/:id", c.supprimerNotification);
