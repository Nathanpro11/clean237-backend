import bcrypt from "bcrypt";
import Permission from "../modules/utilisateurs/models/permission.model";
import Role from "../modules/utilisateurs/models/role.model";
import Utilisateur from "../modules/utilisateurs/models/utilisateur.model";

export const initialiserProfilsEtPermissions = async () => {
  try {
    // ==========================================
    // 1. INITIALISATION DES PERMISSIONS
    // ==========================================
    const permissionsAFaire = [
      { nom: "supprimer_utilisateur", description: "Droit exclusif de suppression administrative" },
      { nom: "modifier_soi_meme", description: "Droit de modifier ses propres informations" },
      { nom: "creer_signalement", description: "Droit d'émettre des signalements de déchets" },
      { nom: "collecter_sallete", description: "Droit terrain de ramassage des ordures" },
      { nom: "creer_role", description: "Droit d'administrer et modifier les rôles de sécurité" }
    ];

    for (const p of permissionsAFaire) {
      await Permission.findOneAndUpdate({ nom: p.nom }, p, { upsert: true, new: true });
    }

    const permSuppr = await Permission.findOne({ nom: "supprimer_utilisateur" });
    const permModif = await Permission.findOne({ nom: "modifier_soi_meme" });
    const permSign = await Permission.findOne({ nom: "creer_signalement" });
    const permColl = await Permission.findOne({ nom: "collecter_sallete" });
    const permRole = await Permission.findOne({ nom: "creer_role" });

    // ==========================================
    // 2. INITIALISATION DES RÔLES / PROFILS
    // ==========================================
    const adminRole = await Role.findOneAndUpdate(
      { nom: "admin" },
      { nom: "admin", description: "Administrateur général", permissionsIds: [permSuppr?._id, permModif?._id, permRole?._id] },
      { upsert: true, new: true }
    );

    const agentRole = await Role.findOneAndUpdate(
      { nom: "agent" },
      { nom: "agent", description: "Agent de collecte sur le terrain", permissionsIds: [permModif?._id, permColl?._id] },
      { upsert: true, new: true }
    );

    const citoyenRole = await Role.findOneAndUpdate(
      { nom: "citoyen" },
      { nom: "citoyen", description: "Utilisateur citoyen standard", permissionsIds: [permModif?._id, permSign?._id] },
      { upsert: true, new: true }
    );

    console.log("⚡ [Clean237] : Rôles, Profils et Permissions synchronisés avec succès !");

    // ==========================================
    // 3. INJECTION AUTOMATIQUE DES COMPTES DE TEST
    // ==========================================
    const sel = await bcrypt.genSalt(10);

    // 👤 A. Création du compte ADMINISTRATEUR par défaut
    const adminExiste = await Utilisateur.findOne({ email: "admin@clean237.cm" });
    if (!adminExiste) {
      const passHache = await bcrypt.hash("adminsecret123", sel);
      const superAdmin = new Utilisateur({
        nom: "Super Administrateur Clean237",
        email: "admin@clean237.cm",
        motDepasse: passHache,
        telephone: "670237237",
        roleId: adminRole._id,
        estActif: true
      });
      await superAdmin.save();
      console.log("👤 [Clean237] : Compte ADMIN injecté par défaut (admin@clean237.cm / adminsecret123)");
    }

    // 👤 B. Création du compte AGENT DE TERRAIN par défaut
    const agentExiste = await Utilisateur.findOne({ email: "agent@clean237.cm" });
    if (!agentExiste) {
      const passHache = await bcrypt.hash("agentsecret123", sel);
      const agentTerrain = new Utilisateur({
        nom: "Agent Kratos Terrain",
        email: "agent@clean237.cm",
        motDepasse: passHache,
        telephone: "699112233",
        roleId: agentRole._id,
        zoneAffectee: "yaounde vi",
        matricule: "AGT-237-001",
        estActif: true
      });
      await agentTerrain.save();
      console.log("👤 [Clean237] : Compte AGENT injecté par défaut (agent@clean237.cm / agentsecret123)");
    }

    // 👤 C. Création du compte CITOYEN par défaut
    const citoyenExiste = await Utilisateur.findOne({ email: "citoyen@clean237.cm" });
    if (!citoyenExiste) {
      const passHache = await bcrypt.hash("citoyensecret123", sel);
      const citoyenStandard = new Utilisateur({
        nom: "Kengfack Citoyen Test",
        email: "citoyen@clean237.cm",
        motDepasse: passHache,
        telephone: "677564222",
        roleId: citoyenRole._id,
        estActif: true
      });
      await citoyenStandard.save();
      console.log("👤 [Clean237] : Compte CITOYEN injecté par défaut (citoyen@clean237.cm / citoyensecret123)");
    }

  } catch (error) {
    console.error("❌ Erreur lors de l'initialisation automatique de la base :", error);
  }
};
