import { Request, Response, NextFunction } from 'express';
import { UtilisateurService } from '../services/utilisateur.service';
import { InscriptionAgentSchema, InscriptionUtilisateurSchema } from '../validators/utilisateurs.validator';

export class UtilisateursController {
  private utilisateurService: UtilisateurService;

  constructor() {
    this.utilisateurService = new UtilisateurService();
  }

  registerUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      
      const { error, value } = InscriptionUtilisateurSchema.validate(req.body, { abortEarly: false });
      if (error) {
        res.status(400).json({ 
          status: 'Erreur de validation',
          details: error.details.map(err => err.message) 
        });
        return;
      }

     
      const nouvelUtilisateur = await this.utilisateurService.creerUtilisateur(value);
      res.status(201).json({
        message: 'Utilisateur cree avec succes',
        data: nouvelUtilisateur
      });
    } catch (err) {
      next(err); 
    }
  };


  registerAgent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      
      const { error, value } = InscriptionAgentSchema.validate(req.body, { abortEarly: false });
      if (error) {
        res.status(400).json({ 
          status: 'Erreur de validation',
          details: error.details.map(err => err.message) 
        });
        return;
      }

      
      const nouvelAgent = await this.utilisateurService.creerAgent(value);
      res.status(201).json({
        message: 'Agent cree avec succes',
        data: nouvelAgent
      });
    } catch (err) {
      next(err); 
    }
  };

}
