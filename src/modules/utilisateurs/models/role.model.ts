import mongoose from "mongoose";

const roleSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
 
  permissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Permission"
  }]
}, {
  timestamps: true
});

export default mongoose.model("Role", roleSchema);
