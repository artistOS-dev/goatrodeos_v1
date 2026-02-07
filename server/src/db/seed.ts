import pool from './connection.js';
import { v4 as uuidv4 } from 'uuid';

async function seed() {
  try {
    console.log('Seeding database...');
    const client = await pool.connect();
    try {
      // Create a sample rodeo
      const rodeoId = uuidv4();
      const rodeoLink = `rodeo-${Math.random().toString(36).substr(2, 9)}`;
      
      await client.query(
        `INSERT INTO rodeos (id, name, unique_link, start_date, end_date, status)
         VALUES ($1, $2, $3, NOW(), NOW() + INTERVAL '7 days', 'active')`,
        [rodeoId, 'Sample Rodeo', rodeoLink]
      );

      // Add sample songs
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
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed().then(() => {
  pool.end();
  process.exit(0);
});
