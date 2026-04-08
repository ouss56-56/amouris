'use server';

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function login(phone: string, password: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const normalizedPhone = phone.replace(/[\s\-\.]/g, '').trim();
  const email = `${normalizedPhone}@amouris.dz`;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error(error.message);

  // Check profile status
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_frozen, role, first_name, last_name, shop_name, phone, wilaya, commune')
    .eq('id', data.user.id)
    .single();

  if (profile?.is_frozen) {
    await supabase.auth.signOut();
    throw new Error('Votre compte est gelé. Veuillez contacter l\'administration.');
  }

  revalidatePath('/');
  return { 
    user: data.user, 
    profile: profile ? {
      id: data.user.id,
      firstName: profile.first_name,
      lastName: profile.last_name,
      shopName: profile.shop_name,
      phoneNumber: profile.phone,
      wilaya: profile.wilaya,
      commune: profile.commune,
      status: profile.is_frozen ? 'frozen' : 'active',
    } : null,
    role: profile?.role 
  };
}

export async function logout() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  }

  revalidatePath('/');
}

export async function getCurrentUser() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return {
    ...user,
    profile
  };
}
