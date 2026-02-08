const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/goatrodeos';

async function setup() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');

  const pool = new Pool({ connectionString, ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false });

  const client = await pool.connect();
  try {
    console.log('Running schema SQL...');
    await client.query(schema);
    console.log('Database schema created/updated successfully.');
  } catch (err) {
    console.error('Error running schema:', err.stack || err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

setup();
