import mongoose from "mongoose";

const zoneSchema = new mongoose.Schema({
    nom: { 
        type: String, 
        required: true 
    },
    description: String
});

export default mongoose.model("Zone", zoneSchema);