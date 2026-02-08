import express from 'express';
import dotenv from 'dotenv';
import corsMiddleware from './middleware/cors.js';
import rodeosRouter from './routes/rodeos.js';
import songsRouter from './routes/songs.js';
import ratingsRouter from './routes/ratings.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(corsMiddleware);
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Diagnostic endpoint
app.get('/api/diagnostic', (req, res) => {
  const dbUrl = process.env.DATABASE_URL || '';
  // Extract host and database name without exposing password
  const match = dbUrl.match(/postgresql:\/\/[^:]+:[^@]+@([^/]+)\/([^\s?]+)/);
  const host = match ? match[1] : 'unknown';
  const database = match ? match[2] : 'unknown';
  
  res.json({
    status: 'ok',
    node_env: process.env.NODE_ENV,
    database_host: host,
    database_name: database,
    port: process.env.PORT || 5000,
    connection_string_masked: dbUrl ? dbUrl.replace(/:[^:@]+@/, ':****@') : 'not configured'
  });
});

// API Routes
app.use('/api/rodeos', rodeosRouter);
app.use('/api/songs', songsRouter);
app.use('/api/ratings', ratingsRouter);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
