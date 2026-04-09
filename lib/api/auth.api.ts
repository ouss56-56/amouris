import { createClient } from '../supabase/client';

const normalizePhone = (phone: string) => {
  return phone.replace(/\s+/g, '').replace(/[-+]/g, '');
};

const getPhoneEmail = (phone: string) => {
  return `${normalizePhone(phone)}@amouris-user.com`;
};

export const authApi = {
  async registerCustomer(data: { phone: string; password?: string; first_name?: string; last_name?: string; wilaya?: string; commune?: string; role?: 'customer' | 'admin' }) {
    const supabase = createClient();
    const phone = normalizePhone(data.phone);
    const email = getPhoneEmail(phone);
    const password = data.password || 'default-password-123'; // In a real app, users should provide a password

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          phone,
          role: data.role || 'customer',
          first_name: data.first_name,
          last_name: data.last_name,
        },
      },
    });

    if (authError) throw authError;

    // The profile is created by a database trigger 'on_auth_user_created'
    // But we might want to update it immediately with additional data
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: data.first_name,
          last_name: data.last_name,
          wilaya: data.wilaya,
          commune: data.commune,
          phone: phone, // ensure phone is set correctly
        })
        .eq('id', authData.user.id);

      if (profileError) console.error('Error updating profile:', profileError);
    }

    return authData.user;
  },

  async loginCustomer(phone: string, password?: string) {
    const supabase = createClient();
    const email = getPhoneEmail(phone);
    const loginPassword = password || 'default-password-123';

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: loginPassword,
    });

    if (error) throw error;
    
    // Fetch profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    return { user: data.user, profile };
  },

  async loginAdmin(email: string, password: string) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    if (profile?.role !== 'admin') {
      await supabase.auth.signOut();
      throw new Error('Unauthorized: Admin access only');
    }

    return data.user;
  },

  async logout() {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return { user, profile };
  }
};
