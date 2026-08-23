import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import signalementRoutes from "./modules/signalement.routes";

const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('API Clean237 OK !');
});

// Routes du module Signalement
app.use('/api', signalementRoutes);

// Connexion à une base MongoDB en mémoire, puis démarrage du serveur
async function demarrer() {
  const mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.connect(uri);
  console.log('Connecté à MongoDB (mémoire)');

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
 }

 demarrer();
 
export default app;