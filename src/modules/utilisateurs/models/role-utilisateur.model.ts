import mongoose from "mongoose";

const roleUtilisateurSchema = new mongoose.Schema({
  roleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Role",
    required: true
  },
  utilisateurId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Utilisateur",
    required: true
  },
  assignerPar: {
    type: String,
    required: true
  },
  dateAssigner: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model("RoleUtilisateur", roleUtilisateurSchema);
