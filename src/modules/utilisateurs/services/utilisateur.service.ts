import bcrypt from "bcrypt";
import createHttpError from "http-errors";
import Utilisateur from "../models/utilisateur.model";
import Role from "../models/role.model";

export async function creerUtilisateurSimple(donnees: {
  nom: string;
  email: string;
  motDepasse: string;
  telephone: string;
}) {
  const emailExiste = await Utilisateur.findOne({ email: donnees.email.toLowerCase() });
  if (emailExiste) {
    throw createHttpError(409, "Un utilisateur existe déjà avec cet e-mail.");
  }

  const sel = await bcrypt.genSalt(10);
  const motDePasseHache = await bcrypt.hash(donnees.motDepasse, sel);

  const nouvelUtilisateur = new Utilisateur({
    nom: donnees.nom,
    email: donnees.email.toLowerCase(),
    motDepasse: motDePasseHache,
    telephone: donnees.telephone,
    roleId: null
  });

  await nouvelUtilisateur.save();
  return {
    message: "Utilisateur créé avec succès !",
    data: nouvelUtilisateur
  };
}

export async function creerOuMettreAJourUtilisateur(donnees: {
  nom: string;
  email: string;
  motDepasse: string;
  telephone: string;
  profil: string; 
  matricule?: string;
  zoneAffectee?: string;
}) {
  const roleTrouve = await Role.findOne({ nom: donnees.profil.toLowerCase() });
  if (!roleTrouve) {
    throw createHttpError(404, `Le profil '${donnees.profil}' est introuvable.`);
  }

  let utilisateur = await Utilisateur.findOne({ email: donnees.email.toLowerCase() });

  if (utilisateur) {
    utilisateur.roleId = roleTrouve._id;
    utilisateur.nom = donnees.nom || utilisateur.nom;
    utilisateur.telephone = donnees.telephone || utilisateur.telephone;
    if (donnees.matricule) utilisateur.matricule = donnees.matricule;
    if (donnees.zoneAffectee) utilisateur.zoneAffectee = donnees.zoneAffectee;

    await utilisateur.save();
    return {
      message: "Compte existant mis à jour avec succès avec son nouveau profil.",
      data: utilisateur
    };
  } else {
    const sel = await bcrypt.genSalt(10);
    const motDePasseHache = await bcrypt.hash(donnees.motDepasse, sel);

    utilisateur = new Utilisateur({
      nom: donnees.nom,
      email: donnees.email.toLowerCase(),
      motDepasse: motDePasseHache,
      telephone: donnees.telephone,
      roleId: roleTrouve._id,
      matricule: donnees.matricule,
      zoneAffectee: donnees.zoneAffectee
    });

    await utilisateur.save();
    return {
      message: "Nouveau compte créé et profil assigné avec succès.",
      data: utilisateur
    };
  }
}

//  Recuperer tous les utilisateurs actifs ou non
export async function listerTousLesUtilisateurs() {
  return await Utilisateur.find().populate({
    path: "roleId",
    populate: { path: "permissionsIds" }
  });
}

export async function modifierUtilisateur(idUser: string, nouvellesDonnees: any) {
  if (nouvellesDonnees.motDepasse) {
    const sel = await bcrypt.genSalt(10);
    nouvellesDonnees.motDepasse = await bcrypt.hash(nouvellesDonnees.motDepasse, sel);
  }

  const user = await Utilisateur.findOneAndUpdate(
    { _id: idUser, estActif: true },
    nouvellesDonnees,
    { new: true }
  );

  if (!user) throw createHttpError(404, "Utilisateur introuvable ou inactif");
  return user;
}

export async function desactiverUtilisateur(idUser: string) {
  const user = await Utilisateur.findByIdAndUpdate(
    idUser,
    { estActif: false },
    { new: true }
  );
  if (!user) throw createHttpError(404, "Utilisateur introuvable");
  return { message: "Compte désactivé avec succès par l'administrateur" };
}
