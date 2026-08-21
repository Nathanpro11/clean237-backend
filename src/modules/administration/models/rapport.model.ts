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
    analyseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Analyse",
      required: true,
    },
    statistiques: {
      type: mongoose.Schema.Types.Mixed,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Rapport", rapportSchema);
