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
    zoneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Zone",
      required: true,
    },
    statistiques: {
      totalAlerts: {
        type: Number,
        required: true,
      },
      activeAlerts: {
        type: Number,
        required: true,
      },
      resolvedAlerts: {
        type: Number,
        required: true,
      },
      totalCollections: {
        type: Number,
        required: true,
      },
      completedCollections: {
        type: Number,
        required: true,
      },
      pendingCollections: {
        type: Number,
        required: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Rapport", rapportSchema);
