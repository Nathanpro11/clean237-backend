import mongoose from "mongoose";

const utilisateurSchema = new mongoose.Schema({
  nom: { 
    type: String, 
    required: true, 
    trim: true 

  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true 

  },
  motDepasse: { 
    type: String, 
    required: true 

  },
  telephone: { 
    type: String, 
    required: true 

  },
  
 
  roleId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Role", 
    default: null, 
    required: false 

  }, 
  
  matricule: { 
    type: String, 
    trim: true },
  zoneAffectee: { 
    type: String, 
    lowercase: true, 
    trim: true 

  }, 

derniereConnexion: { 
  type: Date, 
  default: null 

},
tentativesEchouees: { 
  type: Number, 
  default: 0 

},
bloqueJusquA: { 
  type: Date, 
  default: null 

},

  estActif: { 
    type: Boolean, 
    default: true 

  }
}, { 
  timestamps: true, 
  collection: "utilisateurs" 

});

export default mongoose.model("Utilisateur", utilisateurSchema);
