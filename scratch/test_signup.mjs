import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(url, anonKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function testSignUp() {
  const testEmail = 'user_0797707201@amouris.app';
  console.log('Testing auth.signUp with email:', testEmail);
  
  const { data, error } = await supabase.auth.signUp({
    email: testEmail,
    password: 'password123',
    options: {
      data: {
        phone: '0797707201',
        first_name: 'Test',
        last_name: 'User',
        role: 'customer'
      }
    }
  });

  if (error) {
    console.error('SignUp Error:', error.message);
  } else {
    console.log('SignUp Success:', data.user?.id);
  }
}

testSignUp().catch(console.error);
