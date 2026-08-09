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


   getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      
      const page = parseInt(req.query.page as string) || 1;
      const limite = parseInt(req.query.limite as string) || 10;

      
      const resultat = await this.utilisateurService.listerTout(page, limite);
      res.status(200).json(resultat);
    } catch (err) {
      next(err);
    }
  };


  getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      
      // Appel du service pour trouver le profil correspondant
      const utilisateur = await this.utilisateurService.trouverParId(id);
      
      res.status(200).json(utilisateur);
    } catch (err) {
      next(err);
    }
  };


}
