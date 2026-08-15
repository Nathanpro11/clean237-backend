import mongoose from "mongoose";

const carteSchema = new mongoose.Schema(
  {
    latitudeCentre: { 
        type: Number, 
        required: true
    },
    longitudeCentre: { 
        type: Number, 
        required: true 
    },
    niveauZoom: { 
        type: Number, 
        required: true 
    }
  });

export default mongoose.model("Carte", carteSchema);