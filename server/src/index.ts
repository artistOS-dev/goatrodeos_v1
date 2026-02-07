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
