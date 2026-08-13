import mongoose from "mongoose"

const bacAOrdureSchema = new mongoose .Schema({
    code:String,
    latitude:Number,
    longitude:Number,
    etat:String,
    contenance:Number,
    dateDerniereCollecte:Date
});

export default mongoose.model("BacAOrdure", bacAOrdureSchema);