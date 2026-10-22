import mongoose from "mongoose";
import "../../administration/models/zone.model";

const bacAOrdureSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true },
    longueur: { type: Number, required: true },
    largeur: { type: Number, required: true },
    etat: { type: String, default: "Disponible" },
    contenance: { type: Number, required: true },
    dateDerniereCollecte: Date,
    latitude: { type: Number, required: true, min: -90, max: 90 },
    longitude: { type: Number, required: true, min: -180, max: 180 },
    zone: { type: mongoose.Schema.Types.ObjectId, ref: "Zone", required: true },
  },
  { timestamps: true }
);

export default mongoose.model("BacAOrdure", bacAOrdureSchema);
