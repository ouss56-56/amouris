'use server';

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function login(phone: string, password: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const email = `${phone}@amouris.dz`;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error(error.message);

  revalidatePath('/');
  return data.user;
}

export async function logout() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);

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
