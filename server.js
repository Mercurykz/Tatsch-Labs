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
// Health check endpoint for Platform (Railway) to verify app is responsive
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

// Log environment for debugging
console.log('Starting server', { PORT: port, NODE_ENV: process.env.NODE_ENV });

// Global error handlers to ensure errors appear in logs
process.on('uncaughtException', (err) => {
  console.error('uncaughtException', err);
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  console.error('unhandledRejection', reason);
});

// Deixar o Express decidir automaticamente a melhor interface de rede (IPv4 ou IPv6) do Railway
app.listen(port, () => {
  console.log(`Express server running on port ${port}`);
});
