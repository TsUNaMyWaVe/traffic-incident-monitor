import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import incidentRoutes from './routes/incident.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/incidents', incidentRoutes);

// Only serve static files in development
if (process.env.NODE_ENV !== 'production') {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const clientDistPath = path.join(__dirname, '../../client/dist');

  app.use(express.static(clientDistPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

export default app;
