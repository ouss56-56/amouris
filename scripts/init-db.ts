import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DIRECT_URL;

async function initDb() {
  if (!connectionString) {
    console.error('DIRECT_URL is missing in environment variables');
    process.exit(1);
  }

  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    
    console.log('Reading SQL script...');
    const sqlPath = path.join(__dirname, 'init-db.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Executing SQL script...');
    await client.query(sql);
    
    console.log('Database initialized successfully!');
  } catch (error) {
    console.error('Database initialization failed:', error);
  } finally {
    await client.end();
  }
}

initDb();
