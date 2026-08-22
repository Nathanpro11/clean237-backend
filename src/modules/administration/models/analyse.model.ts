import mongoose from "mongoose";

export const analyseSchema = new mongoose.Schema(
  {
    type: { 
        type: String, 
        required: true 
    },
    periode: {
        start: { type: Date, required: true },
        end: { type: Date, required: true },
    },
    resultat: { 
        type: String, 
        required: false 
    },
    indicateurs: { 
        type: mongoose.Schema.Types.Mixed, 
        required: false 
    },
    donneesUtilisees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "DonneeEnvironnementale",
        required: true,
    }],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Analyse", analyseSchema);

