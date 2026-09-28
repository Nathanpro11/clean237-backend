import { Router } from 'express';
import * as signalementController from './signalement.controller';

const router = Router();

// CRUD Signalement
router.post('/signalements', signalementController.creer);
router.get('/signalements', signalementController.lister);
router.get('/signalements/:id', signalementController.getParId);
router.put('/signalements/:id', signalementController.mettreAJour);
router.delete('/signalements/:id', signalementController.supprimer);

// Action métier
router.patch('/signalements/:id/statut', signalementController.changerStatut);
router.patch('/signalements/:id/annuler', signalementController.annuler);
router.get('/signalements/:id/historique', signalementController.historique);
router.get('/citoyens/:citoyenId/notifications', signalementController.notifications);
export default router;