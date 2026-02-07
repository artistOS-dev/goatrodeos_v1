import { readFileSync } from 'fs';
import { join } from 'path';
import pool from './connection.js';

async function setup() {
  try {
    console.log('Setting up database...');
    const schema = readFileSync(join(import.meta.url.replace('file://', ''), '..', 'schema.sql'), 'utf-8');
    
    const client = await pool.connect();
    try {
      await client.query(schema);
      console.log('Database schema created successfully');
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

setup().then(() => {
  pool.end();
  process.exit(0);
});
