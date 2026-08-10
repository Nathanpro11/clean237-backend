import express from 'express';
// module Gestion Utilisateur
import userRoutes from './modules/utilisateurs/routes/utilisateurs.routes';

const app = express();
const PORT = 3000;

app.use(express.json());

// module Gestion Utilisateur
app.use("/api/utilisateurs", userRoutes);

app.get('/', (req, res) => {
  res.send('API Clean237 OK !');
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});

export default app;
