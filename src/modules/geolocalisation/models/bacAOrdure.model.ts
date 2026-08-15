import mongoose from "mongoose";
import zoneModel from "./zone.model.js";

const bacAOrdureSchema = new mongoose.Schema({
    code: { 
        type: String, 
        required: true, 
        unique: true 
    },
    longueur: { 
        type: Number, 
        required: true 
    },
    largeur: { 
        type: Number, 
        required: true 
    },
    etat: { 
        type: String, 
        default: "Disponible" 
    },
    contenance: { 
        type: Number, 
        required: true 
    },
    dateDerniereCollecte: Date,
    zone: {
         type: mongoose.Schema.Types.ObjectId, 
         ref: "Zone", 
         required: true 
        }
});

export default mongoose.model("BacAOrdure", bacAOrdureSchema);