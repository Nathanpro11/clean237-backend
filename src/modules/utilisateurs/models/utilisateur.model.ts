import mongoose from "mongoose";

const baseUserOptions = {
  discriminatorKey: 'type',
  timestamps: true
};

const utilisateurSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  motDepasse: {
    type: String,
    required: true
  },
  telephone: {
    type: String,
    required: true
  },
  dateInscription: {
    type: Date,
    default: Date.now
  },
  estActif: {
    type: Boolean,
    default: true
  },
  // Relation directe (1) vers le modèle Role
  roleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Role",
    required: true
  }
}, baseUserOptions);

export default mongoose.model("Utilisateur", utilisateurSchema);
