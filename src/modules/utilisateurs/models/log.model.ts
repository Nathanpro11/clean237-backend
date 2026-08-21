import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
  utilisateurId: {
     type: mongoose.Schema.Types.ObjectId, 
     ref: "Utilisateur", 
     required: true 
    },
  action: { 
    type: String, 
    required: true 

  }, 
  // ex: "CONNEXION", "MODIFICATION_PROFIL", "AUTO_SUPPRESSION"
  description: { 
    type: String, 
    required: true 

  },
  ipAddress: { 
    type: String 

  },
}, { 
  timestamps: true, 
  collection: "logs" 

});

export default mongoose.model("Log", logSchema);
