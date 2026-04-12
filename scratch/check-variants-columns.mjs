import pg from 'pg';
const { Client } = pg;
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
async function checkSchema() {
  await client.connect();
  try {
    const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'flacon_variants' AND table_schema = 'public';
    `);
    console.log('Columns in flacon_variants table:');
    console.table(res.rows);
  } catch (err) { console.error(err); } finally { await client.end(); }
}
checkSchema();
