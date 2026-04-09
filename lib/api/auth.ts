'use server'

import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const loginAdmin = async (email: string, password: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return { ok: false, error: error.message };

  // Verify role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single();

  if (profile?.role !== 'admin') {
    await supabase.auth.signOut();
    return { ok: false, error: 'Accès restreint aux administrateurs' };
  }

  return { ok: true, user: data.user };
};

export const loginCustomer = async (phone: string, password?: string) => {
  const supabase = await createClient();
  const normalizedPhone = phone.replace(/\s+/g, '').replace(/[-+]/g, '');
  const email = `${normalizedPhone}@amouris-user.dz`;
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: password || 'default_password_if_needed', // In real app, password is required
  });

  if (error) return { ok: false, error: error.message };

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  return { ok: true, user: data.user, profile };
};

export const registerCustomer = async (data: any) => {
  const admin = createAdminClient();
  const normalizedPhone = data.phone.replace(/\s+/g, '').replace(/[-+]/g, '');
  const email = `${normalizedPhone}@amouris-user.dz`;

  const { data: authUser, error: authError } = await admin.auth.admin.createUser({
    email,
    password: data.password,
    email_confirm: true,
    user_metadata: {
      first_name: data.first_name,
      last_name: data.last_name,
      phone: data.phone, // We store the original phone in metadata for UI
      shop_name: data.shop_name,
      wilaya: data.wilaya,
      commune: data.commune,
      role: 'customer'
    }
  });

  if (authError) return { ok: false, error: authError.message };

  // Profile is created by DB Trigger
  return { ok: true, user: authUser.user };
};

export const logout = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
};

export const getCurrentUser = async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return { user, profile };
};
