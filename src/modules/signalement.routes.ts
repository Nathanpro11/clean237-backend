import { Router } from 'express';
import * as signalementController from './signalement.controller';

const router = Router();

// CRUD Signalement
router.post('/signalements', signalementController.creer);
router.get('/signalements', signalementController.lister);
router.get('/signalements/:id', signalementController.getParId);
router.put('/signalements/:id', signalementController.mettreAJour);
router.delete('/signalements/:id', signalementController.supprimer);

// Actions metier
router.patch('/signalements/:id/statut', signalementController.changerStatut);
router.patch('/signalements/:id/annuler', signalementController.annuler);
router.patch('/signalements/:id/archiver', signalementController.archiver);

// Cote citoyen
router.get('/citoyens/:citoyenId/mes-signalements', signalementController.mesSignalements);
router.get('/citoyens/:citoyenId/statistiques', signalementController.statistiques);

// Cote agent
router.get('/agents/:agentId/a-traiter', signalementController.aTraiter);
router.get('/agents/:agentId/historique', signalementController.historiqueAgent);

// Notifications
router.get('/notifications', signalementController.listerNotificationsCtrl);
router.get('/notifications/:id', signalementController.getNotificationCtrl);
router.patch('/notifications/:id/lu', signalementController.marquerLueCtrl);
router.delete('/notifications/:id', signalementController.supprimerNotificationCtrl);

// Aides de test (simulent Citoyen / AgentDeCollecte)
router.post('/dev/citoyens', signalementController.creerCitoyenTest);
router.post('/dev/agents', signalementController.creerAgentTest);

export default router;