import bcrypt from 'bcrypt';
import Utilisateur from '../models/utilisateur.model';
import Agent from '../models/agent.model';

export class UtilisateurService {
 
  
  async creerUtilisateur(donnees: any) {
   
    const emailExiste = await Utilisateur.findOne({ email: donnees.email });
    if (emailExiste) throw new Error('Un utilisateur existe déjà avec cet email');

   
    const sel = await bcrypt.genSalt(10);
    const motDePasseHache = await bcrypt.hash(donnees.motDepasse, sel);

    
    const nouvelUtilisateur = new Utilisateur({
      nom: donnees.nom,
      email: donnees.email,
      motDepasse: motDePasseHache,
      telephone: donnees.telephone,
      roleId: donnees.roleId
    });
    
    return await nouvelUtilisateur.save();
  }

  
  async creerAgent(donnees: any) {
    const emailExiste = await Agent.findOne({ email: donnees.email });
    if (emailExiste) throw new Error('Un agent existe déjà avec cet email');

    const sel = await bcrypt.genSalt(10);
    const motDePasseHache = await bcrypt.hash(donnees.motDepasse, sel);

    const nouvelAgent = new Agent({
      nom: donnees.nom,
      email: donnees.email,
      motDepasse: motDePasseHache,
      telephone: donnees.telephone,
      zoneAffectee: donnees.zoneAffectee,
      matricule: donnees.matricule,
      roleId: donnees.roleId
    });

    return await nouvelAgent.save();
  }

  
  async trouverParId(id: string) {
    const user = await Utilisateur.findById(id).populate('roleId');
    if (user) return user;

    const agent = await Agent.findById(id).populate('roleId');
    if (!agent) throw new Error('Compte introuvable');
    return agent;
  }

  
  async listerTout() {
    return await Utilisateur.find().populate('roleId');
  }

  
  async modifierInfo(id: string, nouvellesDonnees: any) {
    if (nouvellesDonnees.motDepasse) {
      const sel = await bcrypt.genSalt(10);
      nouvellesDonnees.motDepasse = await bcrypt.hash(nouvellesDonnees.motDepasse, sel);
    }

    let compte = await Utilisateur.findByIdAndUpdate(id, nouvellesDonnees, { new: true });
    if (!compte) {
      compte = await Agent.findByIdAndUpdate(id, nouvellesDonnees, { new: true });
    }

    if (!compte) throw new Error('Compte introuvable');
    return compte;
  }

  async supprimerDefinitif(id: string) {
    let compte = await Utilisateur.findByIdAndUpdate(
      id, 
      { estActif: false }, 
      { new: true }
    );

    if (!compte) {
      compte = await Agent.findByIdAndUpdate(
        id, 
        { estActif: false }, 
        { new: true }
      );
    }
    
    if (!compte) throw new Error('Compte introuvable');
    return { message: 'Compte desactive avec succes' };
  }
}
