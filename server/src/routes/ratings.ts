import express, { Request, Response } from 'express';
import pool from '../db/connection.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Submit a rating (listener)
router.post('/', [
  body('rodeo_id').notEmpty().withMessage('Rodeo ID is required'),
  body('song_id').notEmpty().withMessage('Song ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('user_session_id').notEmpty().withMessage('Session ID is required'),
], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { rodeo_id, song_id, rating, user_session_id } = req.body;

    // Check if user already rated this song in this rodeo
    const existingRating = await pool.query(
      `SELECT id FROM ratings 
       WHERE rodeo_id = $1 AND song_id = $2 AND user_session_id = $3`,
      [rodeo_id, song_id, user_session_id]
    );

    if (existingRating.rows.length > 0) {
      // Update existing rating
      const result = await pool.query(
        `UPDATE ratings 
         SET rating = $1, created_at = NOW()
         WHERE id = $2
         RETURNING *`,
        [rating, existingRating.rows[0].id]
      );
      return res.json(result.rows[0]);
    }

    // Create new rating
    const userIp = (req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '').split(',')[0];
    
    const result = await pool.query(
      `INSERT INTO ratings (rodeo_id, song_id, user_session_id, user_ip, rating)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [rodeo_id, song_id, user_session_id, userIp, rating]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error submitting rating:', error);
    res.status(500).json({ error: 'Failed to submit rating' });
  }
});

// Get ratings for a song
router.get('/song/:song_id', async (req: Request, res: Response) => {
  try {
    const { song_id } = req.params;

    const result = await pool.query(
      `SELECT * FROM ratings 
       WHERE song_id = $1
       ORDER BY created_at DESC`,
      [song_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching ratings:', error);
    res.status(500).json({ error: 'Failed to fetch ratings' });
  }
});

// Get user's ratings for a rodeo
router.get('/rodeo/:rodeo_id/user/:user_session_id', async (req: Request, res: Response) => {
  try {
    const { rodeo_id, user_session_id } = req.params;

    const result = await pool.query(
      `SELECT * FROM ratings 
       WHERE rodeo_id = $1 AND user_session_id = $2`,
      [rodeo_id, user_session_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching user ratings:', error);
    res.status(500).json({ error: 'Failed to fetch ratings' });
  }
});

// Get rodeo statistics
router.get('/rodeo/:rodeo_id/stats', async (req: Request, res: Response) => {
  try {
    const { rodeo_id } = req.params;

    const result = await pool.query(
      `SELECT 
        s.id,
        s.title,
        s.artist,
        COUNT(r.id)::INTEGER as total_votes,
        AVG(r.rating)::NUMERIC as average_rating,
        MIN(r.rating)::INTEGER as min_rating,
        MAX(r.rating)::INTEGER as max_rating
       FROM songs s
       LEFT JOIN ratings r ON s.id = r.song_id
       WHERE s.rodeo_id = $1
       GROUP BY s.id, s.title, s.artist
       ORDER BY average_rating DESC NULLS LAST`,
      [rodeo_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
