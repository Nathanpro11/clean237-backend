import mongoose, { Schema } from "mongoose";

export const STATUTS = ["en_attente", "pris_en_charge", "resolu", "rejete"] as const;
export type StatutSignalement = (typeof STATUTS)[number];

const signalementSchema = new Schema(
  {
    description: { type: String, required: true, minlength: 5, trim: true },
    statut: { type: String, enum: STATUTS, default: "en_attente" },
    photoUrl: { type: String, required: true },
    // En minuscules : comparé à Utilisateur.zoneAffectee (aussi en minuscules)
    quartier: { type: String, required: true, lowercase: true, trim: true },
    precision: { type: String, trim: true },
    // Position GPS du téléphone du citoyen (facultative)
    latitude: { type: Number, min: -90, max: 90 },
    longitude: { type: Number, min: -180, max: 180 },
    motifRejet: { type: String },
    archive: { type: Boolean, default: false },
    citoyenId: { type: Schema.Types.ObjectId, ref: "Utilisateur", required: true },
    agentId: { type: Schema.Types.ObjectId, ref: "Utilisateur" },
    // Alerte créée dans le module administration pour ce signalement
    alerteId: { type: Schema.Types.ObjectId, ref: "DonneeEnvironnementale" },
  },
  { timestamps: true }
);

const notificationSchema = new Schema(
  {
    message: { type: String, required: true },
    lu: { type: Boolean, default: false },
    destinataireId: { type: Schema.Types.ObjectId, ref: "Utilisateur", required: true, index: true },
    signalementId: { type: Schema.Types.ObjectId, ref: "Signalement" },
  },
  { timestamps: true }
);

export const Signalement = mongoose.model("Signalement", signalementSchema);
export const Notification = mongoose.model("Notification", notificationSchema);
