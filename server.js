import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 8080;

// Servir arquivos estáticos do React
app.use(express.static(join(__dirname, 'dist')));

// Lidar com rotas no Frontend (React Router)
app.use((req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

// Deixar o Express decidir automaticamente a melhor interface de rede (IPv4 ou IPv6) do Railway
app.listen(port, () => {
  console.log(`Express server running on port ${port}`);
});
