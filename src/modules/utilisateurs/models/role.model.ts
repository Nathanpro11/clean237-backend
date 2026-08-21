import mongoose from "mongoose";

const roleSchema = new mongoose.Schema({
  nom: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true 

  }, 
  description: { 
    type: String, 
    required: true, 
    trim: true 

  },
  permissionsIds: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Permission" 

  }] // Tableau de liaisons reliees
}, { 
  timestamps: true, 
  collection: "roles" 

});

export default mongoose.model("Role", roleSchema);
