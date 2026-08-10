import bcrypt from 'bcrypt';
import Utilisateur from '../models/utilisateur.model';
import Agent from '../models/agent.model';
import RoleUtilisateur from '../models/role-utilisateur.model';

export class UtilisateurService {
 
  
  async creerUtilisateur(donnees: any) {
    const emailExisteUser = await Utilisateur.findOne({ email: donnees.email });
    const emailExisteAgent = await Agent.findOne({ email: donnees.email });
    if (emailExisteUser || emailExisteAgent) throw new Error('Un utilisateur ou agent existe déjà avec cet email');

    const sel = await bcrypt.genSalt(10);
    const motDePasseHache = await bcrypt.hash(donnees.motDepasse, sel);

    const nouvelUtilisateur = new Utilisateur({
       nom: donnees.nom,
       email: donnees.email,
       telephone: donnees.telephone,
       motDepasse: motDePasseHache
    });
    
    const utilisateurSauvegarde = await nouvelUtilisateur.save();
    const { motDepasse, ...resultat } = utilisateurSauvegarde.toObject();
    return resultat;
  }

  
  async creerAgent(donnees: any) {
    const emailExisteUser = await Utilisateur.findOne({ email: donnees.email });
    const emailExisteAgent = await Agent.findOne({ email: donnees.email });
    if (emailExisteUser || emailExisteAgent) throw new Error('Un utilisateur ou agent existe déjà avec cet email');

    const sel = await bcrypt.genSalt(10);
    const motDePasseHache = await bcrypt.hash(donnees.motDepasse, sel);

    const nouvelAgent = new Agent({
       nom: donnees.nom,
       email: donnees.email,
      telephone: donnees.telephone,
      motDepasse: motDePasseHache
    });

    const agentSauvegarde = await nouvelAgent.save();
    const { motDepasse, ...resultat } = agentSauvegarde.toObject();
    return resultat;
  }

  
  async trouverParEmail(email: string) {
    const user = await Utilisateur.findOne({ email }).populate('roleId');
    if (user) return user;
    return await Agent.findOne({ email }).populate('roleId');
  }

  
  async trouverParId(id: string) {
    const user = await Utilisateur.findById(id).populate('roleId');
    if (user) return user;

    const agent = await Agent.findById(id).populate('roleId');
    if (!agent) throw new Error('Compte introuvable');
    return agent;
  }

  
  async listerTout(page: number = 1, limite: number = 10) {
    const skip = (page - 1) * limite;
    const total = await Utilisateur.countDocuments();
    const utilisateurs = await Utilisateur.find().select('-motDepasse').populate('roleId').skip(skip).limit(limite);

    return { total, page, limite, utilisateurs };
  }

  
  async listerTousLesAgents(page: number = 1, limite: number = 10) {
    const skip = (page - 1) * limite;
    const total = await Agent.countDocuments();
    const agents = await Agent.find().select('-motDepasse').populate('roleId').skip(skip).limit(limite);

    return { total, page, limite, agents };
  }

  
  async modifierInfo(id: string, nouvellesDonnees: any) {
    if (nouvellesDonnees.motDepasse) {
      const sel = await bcrypt.genSalt(10);
      nouvellesDonnees.motDepasse = await bcrypt.hash(nouvellesDonnees.motDepasse, sel);
    }

    let compteModifie = await Utilisateur.findByIdAndUpdate(
      id,
      { $set: nouvellesDonnees },
      { new: true, runValidators: true }
    ).select('-motDepasse');

    if (!compteModifie) {
      compteModifie = await Agent.findByIdAndUpdate(
        id,
        { $set: nouvellesDonnees },
        { new: true, runValidators: true }
      ).select('-motDepasse');
    }

    if (!compteModifie) throw new Error('Compte introuvable pour la mise à jour');
    return compteModifie;
  }

  
  async supprimerDefinitif(id: string) {
    let supprime = await Utilisateur.findByIdAndDelete(id);
    if (!supprime) {
      supprime = await Agent.findByIdAndDelete(id);
    }
    
    if (!supprime) throw new Error('Compte introuvable pour la suppression');
    
    await RoleUtilisateur.deleteMany({ utilisateurId: id });
    return { message: 'Compte et ses liaisons supprimes avec succes' };
  }

 
  async changerStatutActivite(id: string, estActif: boolean) {
    let compte = await Utilisateur.findByIdAndUpdate(id, { $set: { estActif } }, { new: true }).select('-motDepasse');
    if (!compte) {
      compte = await Agent.findByIdAndUpdate(id, { $set: { estActif } }, { new: true }).select('-motDepasse');
    }

    if (!compte) throw new Error('Compte introuvable');
    return compte;
  }

 
  async assignerRoleHistorique(roleId: string, utilisateurId: string, assignerPar: string) {
    const nouvelleLiaison = new RoleUtilisateur({
      roleId,
      utilisateurId,
      assignerPar
    });
    return await nouvelleLiaison.save();
  }
}
