import Permission from "../modules/utilisateurs/models/permission.model";
import Role from "../modules/utilisateurs/models/role.model";

export const initialiserProfilsEtPermissions = async () => {
  try {
    // 1. Définition des permissions requises pour Clean237
    const permissionsAFaire = [
      { nom: "supprimer_utilisateur", description: "Droit exclusif de suppression administrative" },
      { nom: "modifier_soi_meme", description: "Droit de modifier ses propres informations" },
      { nom: "creer_signalement", description: "Droit d'émettre des signalements de déchets" },
      { nom: "collecter_sallete", description: "Droit terrain de ramassage des ordures" }
    ];

    for (const p of permissionsAFaire) {
      await Permission.findOneAndUpdate({ nom: p.nom }, p, { upsert: true, new: true });
    }

    // Récupération des entités créées pour récupérer leurs IDs MongoDB uniques
    const permSuppr = await Permission.findOne({ nom: "supprimer_utilisateur" });
    const permModif = await Permission.findOne({ nom: "modifier_soi_meme" });
    const permSign = await Permission.findOne({ nom: "creer_signalement" });
    const permColl = await Permission.findOne({ nom: "collecter_sallete" });

    // 2. Définition et liaison automatique des Rôles/Profils
    const rolesAFaire = [
      {
        nom: "admin",
        description: "Administrateur général",
        permissionsIds: [permSuppr?._id, permModif?._id]
      },
      {
        nom: "agent",
        description: "Agent de collecte sur le terrain",
        permissionsIds: [permModif?._id, permColl?._id]
      },
      {
        nom: "citoyen",
        description: "Utilisateur citoyen standard",
        permissionsIds: [permModif?._id, permSign?._id]
      }
    ];

    for (const r of rolesAFaire) {
      await Role.findOneAndUpdate({ nom: r.nom }, r, { upsert: true });
    }

    console.log("⚡ [Clean237] : Rôles, Profils et Permissions initialisés automatiquement avec succès !");
  } catch (error) {
    console.error("❌ Erreur lors de l'initialisation de la base :", error);
  }
};
