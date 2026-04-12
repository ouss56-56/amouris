import pg from 'pg';
const { Client } = pg;
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config({ path: '.env.local' });

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('Missing DIRECT_URL or DATABASE_URL');
  process.exit(1);
}

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

const sql = fs.readFileSync('fix_admin_issues.sql', 'utf8');

async function apply() {
  await client.connect();
  console.log('Connected to DB');
  try {
    await client.query(sql);
    console.log('Database fixes applied successfully');
  } catch (err) {
    console.error('Error applying SQL:', err);
  } finally {
    await client.end();
  }
}

apply();
