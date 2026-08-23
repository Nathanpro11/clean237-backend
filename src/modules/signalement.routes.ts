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

export default router;