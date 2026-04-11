import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function runSql() {
  const sqlPath = path.join(process.cwd(), 'scripts', 'wishlist.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  const client = new Client({
    connectionString: process.env.DIRECT_URL,
  });

  try {
    await client.connect();
    console.log('Connected to database');
    await client.query(sql);
    console.log('Successfully executed wishlist.sql');
  } catch (err) {
    console.error('Error executing SQL:', err);
  } finally {
    await client.end();
  }
}

runSql();
