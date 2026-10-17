import { Schema, model, Document, Types } from 'mongoose';

export enum StatutSignalement {
  EN_ATTENTE = 'en_attente',
  PRIS_EN_CHARGE = 'pris_en_charge',
  RESOLU = 'resolu',
  REJETE = 'rejete',
}

// ================================================================
// Citoyen et AgentDeCollecte : versions simplifiees, uniquement
// pour tester les relations de ce module en local.
// ================================================================

export interface ICitoyen extends Document {
  nom: string;
  prenom: string;
  email: string;
  tel: string;
}
const CitoyenSchema = new Schema<ICitoyen>({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  tel: { type: String, required: true },
});
export const Citoyen = model<ICitoyen>('Citoyen', CitoyenSchema);

export interface IAgentDeCollecte extends Document {
  matricule: string;
  zonesAffectees: string[];
}
const AgentDeCollecteSchema = new Schema<IAgentDeCollecte>({
  matricule: { type: String, required: true, unique: true },
  zonesAffectees: { type: [String], required: true },
});
export const AgentDeCollecte = model<IAgentDeCollecte>('AgentDeCollecte', AgentDeCollecteSchema);

// ---------------- Signalement ----------------
export interface ISignalement extends Document {
  description: string;
  statut: StatutSignalement;
  dateCreation: Date;
  photoUrl: string;
  quartier: string;
  precision?: string;
  motifRejet?: string;
  archive: boolean;
  citoyenId: Types.ObjectId;
  agentId?: Types.ObjectId;
}
const SignalementSchema = new Schema<ISignalement>({
  description: { type: String, required: true, minlength: 5 },
  statut: { type: String, enum: Object.values(StatutSignalement), default: StatutSignalement.EN_ATTENTE },
  dateCreation: { type: Date, default: Date.now },
  photoUrl: { type: String, required: true },
  quartier: { type: String, required: true },
  precision: { type: String },
  motifRejet: { type: String },
  archive: { type: Boolean, default: false },
  citoyenId: { type: Schema.Types.ObjectId, ref: 'Citoyen', required: true },
  agentId: { type: Schema.Types.ObjectId, ref: 'AgentDeCollecte' },
});
export const Signalement = model<ISignalement>('Signalement', SignalementSchema);

// ---------------- Notification ----------------
export interface INotification extends Document {
  message: string;
  dateEnvoi: Date;
  lu: boolean;
  destinataire: string;
  signalementId: Types.ObjectId;
  citoyenId?: Types.ObjectId;
  agentId?: Types.ObjectId;
}
const NotificationSchema = new Schema<INotification>({
  message: { type: String, required: true },
  dateEnvoi: { type: Date, default: Date.now },
  lu: { type: Boolean, default: false },
  destinataire: { type: String, enum: ['citoyen', 'agent'], default: 'citoyen' },
  signalementId: { type: Schema.Types.ObjectId, ref: 'Signalement', required: true },
  citoyenId: { type: Schema.Types.ObjectId, ref: 'Citoyen' },
  agentId: { type: Schema.Types.ObjectId, ref: 'AgentDeCollecte' },
});
export const Notification = model<INotification>('Notification', NotificationSchema);