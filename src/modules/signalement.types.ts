import { Schema, model, Document, Types } from 'mongoose';

// ---------------- Enums ----------------
export enum StatutSignalement {
  EN_ATTENTE = 'en_attente',
  EN_COURS = 'en_cours',
  RESOLU = 'resolu',
}

// ================================================================
// Entités temporaires (Citoyen, AgentDeCollecte) — gérées normalement
// par les modules "Utilisateurs" et "Agents de Commande".
// Elles sont dupliquées ici en version simplifiée uniquement pour
// permettre de tester les relations du module Signalement en local.
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
  zoneAffectee: string;
}

const AgentDeCollecteSchema = new Schema<IAgentDeCollecte>({
  matricule: { type: String, required: true, unique: true },
  zoneAffectee: { type: String, required: true },
});

export const AgentDeCollecte = model<IAgentDeCollecte>('AgentDeCollecte', AgentDeCollecteSchema);

// ---------------- Sous-documents ----------------
export interface ICommentaire {
  texte: string;
  date: Date;
}

export interface ISuiviStatut {
  statut: StatutSignalement;
  date: Date;
  commentaire?: string;
}

const CommentaireSchema = new Schema<ICommentaire>(
  {
    texte: { type: String, required: true },
    date: { type: Date, default: Date.now },
  },
  { _id: true }
);

const SuiviStatutSchema = new Schema<ISuiviStatut>(
  {
    statut: { type: String, enum: Object.values(StatutSignalement), required: true },
    date: { type: Date, default: Date.now },
    commentaire: { type: String },
  },
  { _id: true }
);

// ---------------- Signalement ----------------
export interface ISignalement extends Document {
  description: string;
  statut: StatutSignalement;
  dateCreation: Date;
  photoUrl?: string;
  citoyenId: Types.ObjectId;
  agentId?: Types.ObjectId;
  commentaires: ICommentaire[];
  suiviStatuts: ISuiviStatut[];
}

const SignalementSchema = new Schema<ISignalement>({
  description: { type: String, required: true, minlength: 5 },
  statut: {
    type: String,
    enum: Object.values(StatutSignalement),
    default: StatutSignalement.EN_ATTENTE,
  },
  dateCreation: { type: Date, default: Date.now },
  photoUrl: { type: String },
  citoyenId: { type: Schema.Types.ObjectId, ref: 'Citoyen', required: true },
  agentId: { type: Schema.Types.ObjectId, ref: 'AgentDeCollecte' },
  commentaires: { type: [CommentaireSchema], default: [] },
  suiviStatuts: { type: [SuiviStatutSchema], default: [] },
});

export const Signalement = model<ISignalement>('Signalement', SignalementSchema);

// ---------------- Notification ----------------
export interface INotification extends Document {
  message: string;
  dateEnvoi: Date;
  lu: boolean;
  signalementId: Types.ObjectId;
  citoyenId: Types.ObjectId;
}

const NotificationSchema = new Schema<INotification>({
  message: { type: String, required: true },
  dateEnvoi: { type: Date, default: Date.now },
  lu: { type: Boolean, default: false },
  signalementId: { type: Schema.Types.ObjectId, ref: 'Signalement', required: true },
  citoyenId: { type: Schema.Types.ObjectId, ref: 'Citoyen', required: true },
});

export const Notification = model<INotification>('Notification', NotificationSchema);