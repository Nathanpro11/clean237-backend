import mongoose from "mongoose";
import Utilisateur from "./utilisateur.model";


const agentSchema = new mongoose.Schema({
  zoneAffectee: {
    type: String,
    required: true
  },
  matricule: {
    type: String,
    required: true,
    unique: true
  }
});


const Agent = Utilisateur.discriminator("Agent", agentSchema);
export default Agent;
