'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { cookies } from 'next/headers';
import { Customer } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export async function getAllCustomers() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'customer')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching customers:', error);
    return [];
  }

  return (data || []).map(mapDbProfileToCustomer);
}

export async function freezeAccount(userId: string, isFrozen: boolean) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from('profiles')
    .update({ is_frozen: isFrozen })
    .eq('id', userId);

  if (error) throw new Error(error.message);

  revalidatePath('/admin/customers');
}

export async function deleteAccount(userId: string) {
  const cookieStore = cookies();
  const supabase = createAdminClient();

  // 1. Delete from auth.users (requires admin client)
  const { error: authError } = await supabase.auth.admin.deleteUser(userId);
  if (authError) throw new Error('Failed to delete auth user: ' + authError.message);

  // 2. Profile deletion should happen via ON DELETE CASCADE or manually
  // In our schema profiles references auth.users(id), so we might need to delete it.

  revalidatePath('/admin/customers');
}

export async function registerCustomer(customerData: {
  firstName: string;
  lastName: string;
  shopName?: string;
  phone: string;
  password: string;
  wilaya: string;
  commune: string;
}) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Construct dummy email as specified in requirements
  const email = `${customerData.phone}@amouris.dz`;

  // 1. Sign up user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password: customerData.password,
    options: {
      data: {
        phone: customerData.phone,
        first_name: customerData.firstName,
        last_name: customerData.lastName,
      }
    }
  });

  if (authError) throw new Error(authError.message);
  if (!authData.user) throw new Error('User creation failed');

  // 2. Create profile
  const { error: profileError } = await supabase
    .from('profiles')
    .insert([{
      id: authData.user.id,
      first_name: customerData.firstName,
      last_name: customerData.lastName,
      shop_name: customerData.shopName,
      phone: customerData.phone,
      wilaya: customerData.wilaya,
      commune: customerData.commune,
      role: 'customer',
    }]);

  if (profileError) {
    // Ideally roll back auth user if profile fails
    console.error('Profile creation failed:', profileError);
    throw new Error('Profile creation failed: ' + profileError.message);
  }

  return authData.user;
}

export async function updateProfile(userId: string, data: {
  firstName: string;
  lastName: string;
  shopName: string;
  wilaya: string;
  commune: string;
}) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from('profiles')
    .update({
      first_name: data.firstName,
      last_name: data.lastName,
      shop_name: data.shopName,
      wilaya: data.wilaya,
      commune: data.commune,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) throw new Error(error.message);

  revalidatePath('/account');
  revalidatePath('/account/settings');
}

export async function getCustomerById(id: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    console.error('Error fetching customer by id:', error);
    return null;
  }

  return mapDbProfileToCustomer(data);
}

function mapDbProfileToCustomer(dbProfile: any): Customer {
  return {
    id: dbProfile.id,
    firstName: dbProfile.first_name,
    lastName: dbProfile.last_name,
    shopName: dbProfile.shop_name,
    phoneNumber: dbProfile.phone,
    wilaya: dbProfile.wilaya,
    commune: dbProfile.commune,
    status: dbProfile.is_frozen ? 'frozen' : 'active',
    joinedAt: dbProfile.created_at,
  };
}
