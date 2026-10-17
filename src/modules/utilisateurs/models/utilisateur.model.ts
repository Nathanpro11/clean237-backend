import mongoose from "mongoose";

const utilisateurSchema = new mongoose.Schema({
  nom: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  motDepasse: { type: String, required: true },
  telephone: { type: String, required: true },
  roleId: { type: mongoose.Schema.Types.ObjectId, ref: "Role", default: null, required: false },
  matricule: { type: String, trim: true },
  zoneAffectee: { type: String, lowercase: true, trim: true },
  derniereConnexion: { type: Date, default: null },
  tentativesEchouees: { type: Number, default: 0 },
  bloqueJusquA: { type: Date, default: null },
  estActif: { type: Boolean, default: true },

  // Connexion Google : identifiant stable du compte Google (champ "sub" du jeton).
  googleId: { type: String },

  // Mot de passe oublié : empreinte SHA-256 du token (jamais le token brut) et son expiration.
  resetTokenHash: { type: String, select: false },
  resetTokenExpire: { type: Date },
   resetTentatives: { type: Number, default: 0 }
}, {
  timestamps: true,
  collection: "utilisateurs",
  // Le hash du mot de passe, les compteurs de sécurité et les données de réinitialisation
  // ne sont jamais sérialisés en JSON.
  // (user.motDepasse reste lisible côté serveur pour bcrypt.compare.)
  toJSON: {
    transform: (_doc, ret: any) => {
      const {
        motDepasse, tentativesEchouees, bloqueJusquA, __v,
        resetTokenHash, resetTokenExpire, resetTentatives, googleId,
        ...propre
      } = ret;
      return propre;
    }
  }
});

export default mongoose.model("Utilisateur", utilisateurSchema);