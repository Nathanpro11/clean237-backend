import mongoose from "mongoose";

const localisationSchema = new mongoose.Schema(
  {
    libelle: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    utilisateurId: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Localisation", localisationSchema);
