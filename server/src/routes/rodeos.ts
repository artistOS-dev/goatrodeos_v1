import express, { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../db/connection.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Create a new rodeo (admin)
router.post('/', [
  body('name').trim().notEmpty().withMessage('Rodeo name is required'),
  body('start_date').isISO8601().withMessage('Valid start date is required'),
  body('end_date').isISO8601().withMessage('Valid end date is required'),
], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, start_date, end_date, created_by } = req.body;
    const unique_link = `rodeo-${uuidv4().substring(0, 8)}`;
    
    const result = await pool.query(
      `INSERT INTO rodeos (name, unique_link, created_by, start_date, end_date, status)
       VALUES ($1, $2, $3, $4, $5, 'active')
       RETURNING *`,
      [name, unique_link, created_by, start_date, end_date]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating rodeo:', error);
    res.status(500).json({ error: 'Failed to create rodeo' });
  }
});

// Get all rodeos (admin)
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM rodeos ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching rodeos:', error);
    res.status(500).json({ error: 'Failed to fetch rodeos' });
  }
});

// Get rodeo by unique link (listener)
router.get('/link/:unique_link', async (req: Request, res: Response) => {
  try {
    const { unique_link } = req.params;
    
    const rodeoResult = await pool.query(
      'SELECT * FROM rodeos WHERE unique_link = $1',
      [unique_link]
    );

    if (rodeoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Rodeo not found' });
    }

    const rodeo = rodeoResult.rows[0];
    const songsResult = await pool.query(
      'SELECT * FROM songs WHERE rodeo_id = $1 ORDER BY created_at',
      [rodeo.id]
    );

    res.json({
      ...rodeo,
      songs: songsResult.rows,
    });
  } catch (error) {
    console.error('Error fetching rodeo:', error);
    res.status(500).json({ error: 'Failed to fetch rodeo' });
  }
});

// Get rodeo details with songs and ratings
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const rodeoResult = await pool.query(
      'SELECT * FROM rodeos WHERE id = $1',
      [id]
    );

    if (rodeoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Rodeo not found' });
    }

    const songsResult = await pool.query(
      `SELECT s.*, 
              COUNT(r.id)::INTEGER as total_votes,
              AVG(r.rating)::NUMERIC as average_rating
       FROM songs s
       LEFT JOIN ratings r ON s.id = r.song_id
       WHERE s.rodeo_id = $1
       GROUP BY s.id
       ORDER BY s.created_at`,
      [id]
    );

    res.json({
      ...rodeoResult.rows[0],
      songs: songsResult.rows,
    });
  } catch (error) {
    console.error('Error fetching rodeo:', error);
    res.status(500).json({ error: 'Failed to fetch rodeo' });
  }
});

// Update rodeo (admin)
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, start_date, end_date, status } = req.body;

    const result = await pool.query(
      `UPDATE rodeos 
       SET name = COALESCE($2, name),
           start_date = COALESCE($3, start_date),
           end_date = COALESCE($4, end_date),
           status = COALESCE($5, status),
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, name, start_date, end_date, status]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rodeo not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating rodeo:', error);
    res.status(500).json({ error: 'Failed to update rodeo' });
  }
});

// Delete rodeo (admin)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM rodeos WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rodeo not found' });
    }

    res.json({ message: 'Rodeo deleted successfully' });
  } catch (error) {
    console.error('Error deleting rodeo:', error);
    res.status(500).json({ error: 'Failed to delete rodeo' });
  }
});

export default router;
