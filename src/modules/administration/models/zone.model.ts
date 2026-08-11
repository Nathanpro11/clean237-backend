import mongoose from "mongoose";

export const zoneSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
    unique: true
  },
  quartier: {
    type: String,
    required: true,
    unique: true
  },

  etat : {
    type: String,
    required: true,
    default: "actif"
  }
})

export default mongoose.model("Zone", zoneSchema);