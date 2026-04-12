'use server';

import { createAdminClient } from '@/lib/supabase/admin';

export async function resetPasswordAction(customerId: string, newPassword?: string) {
  try {
    const admin = createAdminClient();
    const pwd = newPassword || `pwd_reset_${Math.random().toString(36).slice(2, 8)}`;
    
    const { data, error } = await admin.auth.admin.updateUserById(customerId, { 
      password: pwd 
    });

    if (error) {
      console.error('Password reset error:', error);
      throw new Error(error.message);
    }

    return { success: true, password: pwd };
  } catch (error: any) {
    console.error('CRITICAL: Server Action resetPasswordAction failed:', error);
    throw new Error(error.message || 'Error occurred while resetting password');
  }
}
