import mongoose from "mongoose";

export const rapportSchema = new mongoose.Schema(
  {
    titre: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    type: {
      type: String,
      enum: ["synthese", "suivi", "export"],
      default: "synthese",
    },
    statut: {
      type: String,
      enum: ["pret", "en_cours", "archive"],
      default: "pret",
    },
    format: {
      type: String,
      enum: ["pdf", "csv"],
      default: "pdf",
    },
    analyseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Analyse",
      required: true,
    },
    statistiques: {
      type: mongoose.Schema.Types.Mixed,
      required: false,
    },
    zones: [
      {
        _id: { type: mongoose.Schema.Types.ObjectId, required: true },
        nom: { type: String, required: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Rapport", rapportSchema);
