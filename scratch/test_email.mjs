import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function testEmail() {
  const testEmail = '0797707200@amouris.app';
  console.log('Testing SignUp with email:', testEmail);
  
  const { data, error } = await supabase.auth.admin.createUser({
    email: testEmail,
    password: 'password123',
    email_confirm: true,
  });

  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('Success:', data.user.id);
    await supabase.auth.admin.deleteUser(data.user.id);
  }
  
  const testEmail2 = 'test0797707200@amouris.app';
  console.log('Testing SignUp with email:', testEmail2);
  
  const { data: data2, error: error2 } = await supabase.auth.admin.createUser({
    email: testEmail2,
    password: 'password123',
    email_confirm: true,
  });

  if (error2) {
    console.error('Error (2):', error2.message);
  } else {
    console.log('Success (2):', data2.user.id);
    await supabase.auth.admin.deleteUser(data2.user.id);
  }
}

testEmail().catch(console.error);
