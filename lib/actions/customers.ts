'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function freezeCustomerAction(id: string, is_frozen: boolean) {
  const admin = createAdminClient()
  const { error } = await admin
    .from('profiles')
    .update({ is_frozen })
    .eq('id', id)
  
  if (error) {
    console.error('Error freezing customer:', error)
    throw new Error(error.message)
  }
  
  revalidatePath('/admin/customers')
  revalidatePath(`/admin/customers/${id}`)
  return { success: true }
}

export async function deleteCustomerAction(id: string) {
  const admin = createAdminClient()
  
  // 1. Delete Auth User (this will trigger cascade if set up, or we might need to delete profile manual if no cascade)
  const { error: authError } = await admin.auth.admin.deleteUser(id)
  if (authError) {
    console.error('Error deleting auth user:', authError)
    throw new Error(authError.message)
  }

  // 2. Profile and orders should cascade if database configured correctly, 
  // but let's be safe if needed. Most Supabase setups have profiles linked by UUID.
  
  revalidatePath('/admin/customers')
  return { success: true }
}

export async function resetCustomerPasswordAction(id: string, newPassword?: string) {
  const admin = createAdminClient()
  const pwd = newPassword || `amouris_${Math.random().toString(36).slice(2, 10)}`
  
  const { error } = await admin.auth.admin.updateUserById(id, { 
    password: pwd
  })
  
  if (error) {
    console.error('Error resetting password:', error)
    throw new Error(error.message)
  }
  
  return { success: true, password: pwd }
}
