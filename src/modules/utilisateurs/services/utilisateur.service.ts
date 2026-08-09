import bcrypt from 'bcrypt';
import Utilisateur from '../models/utilisateur.model';
import Agent from '../models/agent.model';
import RoleUtilisateur from '../models/role-utilisateur.model';

export class UtilisateurService {
 
  async creerUtilisateur(donnees: any) {
   
    const emailExiste = await Utilisateur.findOne({ email: donnees.email });
    if (emailExiste) throw new Error('Un utilisateur existe déjà avec cet email');

    
    const sel = await bcrypt.genSalt(10);
    const motDePasseHache = await bcrypt.hash(donnees.motDepasse, sel);

   
    const nouvelUtilisateur = new Utilisateur({
      ...donnees,
      motDepasse: motDePasseHache
    });
    
    const utilisateurSauvegarde = await nouvelUtilisateur.save();
    
    const { motDepasse, ...resultat } = utilisateurSauvegarde.toObject();
    return resultat;
  }

  
  async creerAgent(donnees: any) {
    const emailExiste = await Utilisateur.findOne({ email: donnees.email });
    if (emailExiste) throw new Error('Un utilisateur/agent existe déjà avec cet email');

    const sel = await bcrypt.genSalt(10);
    const motDePasseHache = await bcrypt.hash(donnees.motDepasse, sel);

    const nouvelAgent = new Agent({
      ...donnees,
      motDepasse: motDePasseHache
    });

    const agentSauvegarde = await nouvelAgent.save();
    const { motDepasse, ...resultat } = agentSauvegarde.toObject();
    return resultat;
  }

 
  async trouverParEmail(email: string) {
    return await Utilisateur.findOne({ email }).populate('roleId');
  }

  
  async trouverParId(id: string) {
    const utilisateur = await Utilisateur.findById(id).populate('roleId');
    if (!utilisateur) throw new Error('Utilisateur introuvable');
    return utilisateur;
  }

  
  async listerTout(page: number = 1, limite: number = 10) {
    const skip = (page - 1) * limite;
    const total = await Utilisateur.countDocuments();
    const utilisateurs = await Utilisateur.find().select('-motDepasse').populate('roleId').skip(skip).limit(limite);

    return { total, page, limite, utilisateurs };
  }

  
  async modifierInfo(id: string, nouvellesDonnees: any) {
    if (nouvellesDonnees.motDepasse) {
      const sel = await bcrypt.genSalt(10);
      nouvellesDonnees.motDepasse = await bcrypt.hash(nouvellesDonnees.motDepasse, sel);
    }

    const utilisateurModifie = await Utilisateur.findByIdAndUpdate(
      id,
      { $set: nouvellesDonnees },
      { new: true, runValidators: true }
    ).select('-motDepasse');

    if (!utilisateurModifie) throw new Error('Utilisateur introuvable pour la mise à jour');
    return utilisateurModifie;
  }

  
  async supprimerDefinitif(id: string) {
    const supprime = await Utilisateur.findByIdAndDelete(id);
    if (!supprime) throw new Error('Utilisateur introuvable pour la suppression');
    
    await RoleUtilisateur.deleteMany({ utilisateurId: id });
    return { message: 'Utilisateur et ses liaisons supprimes avec succes' };
  }

  
  async changerStatutActivite(id: string, estActif: boolean) {
    const utilisateur = await Utilisateur.findByIdAndUpdate(
      id,
      { $set: { estActif } },
      { new: true }
    ).select('-motDepasse');

    if (!utilisateur) throw new Error('Utilisateur introuvable');
    return utilisateur;
  }

 
  async assignerRoleHistorique(roleId: string, utilisateurId: string, assignerPar: string) {
    try {
      const nouvelleLiaison = new RoleUtilisateur({
        roleId,
        utilisateurId,
        assignerPar
      });
      return await nouvelleLiaison.save();
    } catch (error: any) {
      if (error.code === 11000) {
        throw new Error('Ce rôle est deja assigné à cet utilisateur (Doublon bloqué par l\'index unique)');
      }
      throw error;
    }
  }
}
