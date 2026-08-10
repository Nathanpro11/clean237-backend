import mongoose from "mongoose";

const agentSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  motDepasse: {
    type: String,
    required: true
  },
  telephone: {
    type: String,
    required: true
  },
  zoneAffectee: {
    type: String,
    required: true
  },
  matricule: {
    type: String,
    required: true,
    unique: true
  },
  roleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Role",
    required: true
  }
}, {
  timestamps: true,
   collection: "agents"
});

export default mongoose.model("Agent", agentSchema);
