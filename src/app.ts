import express from 'express';
import mongoose from 'mongoose';
import userRoutes from './modules/utilisateurs/routes/utilisateurs.routes';

const app = express();

const PORT = 3001; 

app.use(express.json());


mongoose.connect('mongodb://127.0.0.1:27017/clean237')
  .then(() => console.log('✅ Version Simple : Connecté à MongoDB avec succès !'))
  .catch((err) => console.error('❌ Échec de la connexion MongoDB :', err));

// routeur de module utlisateur
app.use("/api/utilisateurs", userRoutes);

app.get('/', (req, res) => {
  res.send('API Clean237 OK !');
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});

export default app;
