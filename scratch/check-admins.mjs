import pg from 'pg';
const { Client } = pg;
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function checkAdmins() {
  await client.connect();
  try {
    const res = await client.query(`
      SELECT id, first_name, last_name, role 
      FROM profiles 
      WHERE role = 'admin';
    `);
    console.log('Admin Profiles:');
    console.table(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

checkAdmins();
