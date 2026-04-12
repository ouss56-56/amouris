import { createClient } from '@/lib/supabase/client';
import { createAdminClient } from '@/lib/supabase/admin';

export const fetchAllCustomers = async (client?: any) => {
  const supabase = client || createClient();
  const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching customers:', error);
    return [];
  }
  return data;
};

export const fetchCustomerById = async (id: string, client?: any) => {
  const supabase = client || createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*, orders(*)')
    .eq('id', id)
    .single();
    
  if (error) {
    console.error(`Error fetching customer ${id}:`, error);
    return null;
  }
  return data;
};

export const updateCustomer = async (id: string, updates: any) => {
  const supabase = createClient();
  const { error } = await supabase.from('profiles').update(updates).eq('id', id);
  if (error) throw error;
  return true;
};

export const freezeCustomer = async (id: string, is_frozen: boolean) => {
  const admin = createAdminClient();
  const { error } = await admin.from('profiles').update({ is_frozen }).eq('id', id);
  if (error) throw error;
  return true;
};

export const deleteCustomer = async (id: string) => {
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) throw error;
  return true;
};

export const resetCustomerPassword = async (id: string, newPassword?: string) => {
  const admin = createAdminClient();
  const pwd = newPassword || `pwd_reset_${Math.random().toString(36).slice(2,8)}`;
  const { error } = await admin.auth.admin.updateUserById(id, { password: pwd });
  if (error) throw error;
  return { success: true, password: pwd };
};

// Alias used by SettingsClient
export const updateCustomerProfile = updateCustomer;
