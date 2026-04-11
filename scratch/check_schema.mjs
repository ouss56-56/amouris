import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';

dotenv.config();

async function checkSchema() {
  const client = new Client({
    connectionString: process.env.DIRECT_URL,
  });

  try {
    await client.connect();
    console.log('--- PRODUCTS TABLE ---');
    const resProducts = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'id'");
    console.log(resProducts.rows);

    console.log('--- PROFILES TABLE ---');
    const resProfiles = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'id'");
    console.log(resProfiles.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

checkSchema();
