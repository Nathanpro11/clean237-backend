import mongoose from "mongoose";

const utilisateurSchema = new mongoose.Schema({
  nom: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  motDepasse: { type: String, required: true },
  telephone: { type: String, required: true },
  
  // 🔗 Liaison obligatoire vers le rôle unique
  roleId: { type: mongoose.Schema.Types.ObjectId, ref: "Role", default: null, required: false }, 
  
  // 🦺 Attributs specifiques aux Agents (laisses vides/optionnels pour les citoyens et admins)
  matricule: { type: String, trim: true },
  zoneAffectee: { type: String, lowercase: true, trim: true }, 
  // Ajouts dans le schéma Mongoose de l'utilisateur :
derniereConnexion: { type: Date, default: null },
tentativesEchouees: { type: Number, default: 0 },
bloqueJusquA: { type: Date, default: null },

  estActif: { type: Boolean, default: true }
}, { timestamps: true, collection: "utilisateurs" });

export default mongoose.model("Utilisateur", utilisateurSchema);
