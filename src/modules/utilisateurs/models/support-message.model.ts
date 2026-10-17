import mongoose from "mongoose";

const supportMessageSchema = new mongoose.Schema({
  utilisateurId: { type: mongoose.Schema.Types.ObjectId, ref: "Utilisateur", required: true },
  message: { type: String, required: true, trim: true, maxlength: 2000 },
  statut: { type: String, enum: ["nouveau", "lu", "traite"], default: "nouveau" }
}, {
  timestamps: true,
  collection: "messages_support"
});

export default mongoose.model("SupportMessage", supportMessageSchema);