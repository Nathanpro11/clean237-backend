import mongoose from "mongoose";

const permissionSchema = new mongoose.Schema({
  nom: { type: String, required: true, unique: true, lowercase: true, trim: true }, // "supprimer_utilisateur", "modifier_soi_meme", "creer_signalement", "recevoir_signalement"
  description: { type: String, required: true, trim: true }
}, { timestamps: true, collection: "permissions" });

export default mongoose.model("Permission", permissionSchema);
