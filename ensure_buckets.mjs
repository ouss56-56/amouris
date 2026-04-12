import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const buckets = ['products', 'brands', 'collections', 'categories', 'invoices'];

async function ensureBuckets() {
  for (const bucket of buckets) {
    console.log(`Checking bucket: ${bucket}`);
    const { data: bucketData, error: getError } = await supabase.storage.getBucket(bucket);
    
    if (getError) {
      console.log(`Creating bucket: ${bucket}`);
      const { data, error } = await supabase.storage.createBucket(bucket, {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
        fileSizeLimit: 5242880 // 5MB
      });
      if (error) {
        console.error(`Error creating bucket ${bucket}:`, error.message);
      } else {
        console.log(`Bucket ${bucket} created successfully`);
      }
    } else {
      console.log(`Bucket ${bucket} already exists`);
      // Update it to be public just in case
      await supabase.storage.updateBucket(bucket, { public: true });
    }
    
    // Create RLS policies for storage (this usually needs to be done via SQL, 
    // but the service role key bypasses RLS for uploads. 
    // Public read however is needed).
  }
}

ensureBuckets();
