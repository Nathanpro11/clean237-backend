import mongoose from "mongoose";

const permissionSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  }
}, {
  timestamps: true 
});

export default mongoose.model("Permission", permissionSchema);
