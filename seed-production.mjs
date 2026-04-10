import pg from 'pg';
const { Client } = pg;
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const connectionString = process.env.DIRECT_URL;

if (!connectionString) {
  console.error('Missing DIRECT_URL in .env.local');
  process.exit(1);
}

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function seed() {
  console.log('Connecting to Supabase (Direct Connection)...');
  await client.connect();
  console.log('Connected.');

  try {
    const sqlPath = path.join(process.cwd(), 'amouris-production.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Executing amouris-production.sql...');
    // We split by semicolon if possible, but for a large file, pg.query(sql) sometimes works if it's one big block.
    // However, some SQL scripts have complex blocks. pg-native or splitting is safer.
    // But for a migration script, usually pg handles the whole string if it's valid SQL.
    await client.query(sql);
    console.log('Database seeded successfully!');
  } catch (err) {
    console.error('Error during seeding:', err);
  } finally {
    await client.end();
  }
}

seed();
