import BacModel from "../models/bacAOrdure.model";
import ZoneModel from "../../administration/models/zone.model";
import { gerer } from "../utils/http";

export const carte = gerer(async (_req, res) => {
  const [zones, bacs] = await Promise.all([
    ZoneModel.find().sort({ nom: 1 }).lean(),
    BacModel.find().populate("zone", "nom").lean(),
  ]);
  res.status(200).json({ zones, bacs });
});
