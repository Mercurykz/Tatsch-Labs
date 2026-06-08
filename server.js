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

// Forçar o express a bindar no host '0.0.0.0' usando a PORT do Railway
app.listen(port, '0.0.0.0', () => {
  console.log(`Express server running natively on 0.0.0.0:${port}`);
});
