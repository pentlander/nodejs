const { Pool } = require('pg');

let pool = null;
let dbReady = false;

// Create the items table if it doesn't exist
async function initDb() {
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not set — running without Postgres');
    return;
  }

  try {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    await pool.query(`
      CREATE TABLE IF NOT EXISTS items (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    dbReady = true;
    console.log('Database initialized — items table ready');
  } catch (err) {
    console.error('Failed to connect to Postgres:', err.message);
    console.warn('Running without Postgres — /api/items will return 503');
    pool = null;
  }
}

function getPool() {
  return pool;
}

function isDbReady() {
  return dbReady;
}

module.exports = { getPool, isDbReady, initDb };
