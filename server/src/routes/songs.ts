import express, { Request, Response } from 'express';
import pool from '../db/connection.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Add song to rodeo (admin)
router.post('/', [
  body('rodeo_id').notEmpty().withMessage('Rodeo ID is required'),
  body('title').trim().notEmpty().withMessage('Song title is required'),
  body('artist').trim().optional(),
  body('duration').optional().isInt().withMessage('Duration must be a number'),
], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { rodeo_id, title, artist, duration, spotify_url, youtube_url } = req.body;

    const result = await pool.query(
      `INSERT INTO songs (rodeo_id, title, artist, duration, spotify_url, youtube_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [rodeo_id, title, artist, duration, spotify_url, youtube_url]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding song:', error);
    res.status(500).json({ error: 'Failed to add song' });
  }
});

// Get songs for a rodeo
router.get('/rodeo/:rodeo_id', async (req: Request, res: Response) => {
  try {
    const { rodeo_id } = req.params;

    const result = await pool.query(
      `SELECT s.*, 
              COUNT(r.id)::INTEGER as total_votes,
              AVG(r.rating)::NUMERIC as average_rating
       FROM songs s
       LEFT JOIN ratings r ON s.id = r.song_id
       WHERE s.rodeo_id = $1
       GROUP BY s.id
       ORDER BY s.created_at`,
      [rodeo_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching songs:', error);
    res.status(500).json({ error: 'Failed to fetch songs' });
  }
});

// Update song (admin)
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, artist, duration, spotify_url, youtube_url } = req.body;

    const result = await pool.query(
      `UPDATE songs 
       SET title = COALESCE($2, title),
           artist = COALESCE($3, artist),
           duration = COALESCE($4, duration),
           spotify_url = COALESCE($5, spotify_url),
           youtube_url = COALESCE($6, youtube_url)
       WHERE id = $1
       RETURNING *`,
      [id, title, artist, duration, spotify_url, youtube_url]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Song not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating song:', error);
    res.status(500).json({ error: 'Failed to update song' });
  }
});

// Delete song (admin)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM songs WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Song not found' });
    }

    res.json({ message: 'Song deleted successfully' });
  } catch (error) {
    console.error('Error deleting song:', error);
    res.status(500).json({ error: 'Failed to delete song' });
  }
});

export default router;
