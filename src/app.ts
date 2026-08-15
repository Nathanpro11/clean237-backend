import express from 'express';
import mongoose from 'mongoose';
import bacAOrdureRoutes from "./modules/geolocalisation/routes/bacAOrdure.route.js";
import { errorHandler } from './middlewares/errorHandler';

const app = express();

const PORT = 3000;

// Configuration MongoDB
const uri = 'mongodb://127.0.0.1:27017/clean237';

mongoose
  .connect(uri)
  .then(() => console.log('✅ MongoDB connecté'))
  .catch((err) => console.error('❌ Erreur MongoDB :', err));

// Middlewares
app.use(express.json());

// Route principale
app.get('/', (req, res) => {
  res.send('API Clean237 OK !');
});

// Routes
app.use('/api/v1/bacs', bacAOrdureRoutes);


// Gestion des erreurs
app.use(errorHandler);

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});

export default app;