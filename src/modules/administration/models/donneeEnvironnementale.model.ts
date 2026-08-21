import mongoose from "mongoose";

export const donneeEnvironnementaleSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    zoneId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "zone",
          required: true,
        },
    valeur: { type: Number, required: true },
    unite: { type: String, required: false },
    date: { type: Date, required: true, default: Date.now },
    source: { type: String, required: false },
    description: { type: String, required: false },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("DonneeEnvironnementale", donneeEnvironnementaleSchema);
