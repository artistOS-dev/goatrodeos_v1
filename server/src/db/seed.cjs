const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

const connectionString = process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/goatrodeos';

const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function seed() {
  const client = await pool.connect();
  try {
    console.log('Seeding database...');

    const rodeoId = uuidv4();
    const rodeoLink = `rodeo-${Math.random().toString(36).substr(2, 9)}`;

    await client.query(
      `INSERT INTO rodeos (id, name, unique_link, start_date, end_date, status)
       VALUES ($1, $2, $3, NOW(), NOW() + INTERVAL '7 days', 'active')`,
      [rodeoId, 'Sample Rodeo', rodeoLink]
    );

    const songs = [
      { title: 'Song One', artist: 'Artist A', duration: 180 },
      { title: 'Song Two', artist: 'Artist B', duration: 200 },
      { title: 'Song Three', artist: 'Artist C', duration: 190 },
    ];

    for (const song of songs) {
      await client.query(
        `INSERT INTO songs (rodeo_id, title, artist, duration)
         VALUES ($1, $2, $3, $4)`,
        [rodeoId, song.title, song.artist, song.duration]
      );
    }

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error.stack || error);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
