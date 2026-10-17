import bcrypt from "bcrypt";
import Role from "../modules/utilisateurs/models/role.model";
import Utilisateur from "../modules/utilisateurs/models/utilisateur.model";

export const creerAdminParDefaut = async () => {
  const email = (process.env.ADMIN_EMAIL || "admin@clean237.cm").toLowerCase();
  if (await Utilisateur.exists({ email })) return;
  const role = await Role.findOne({ nom: "admin" });
  if (!role) return console.warn("Rôle admin introuvable : seed ignoré");

  await new Utilisateur({
    nom: "Admin Yaoundé VI",
    email,
    telephone: "+237600000002",
    motDepasse: await bcrypt.hash(process.env.ADMIN_PASSWORD || "ChangeMe123!", 10),
    roleId: role._id,
  }).save();
  console.log(`👤 Admin créé : ${email}`);
};