'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function deleteInvoiceAction(orderId: string) {
  try {
    const admin = createAdminClient()
    
    console.log(`Attempting to delete invoice for order: ${orderId}`)
    
    // 1. Reset invoice flags in orders table
    const { error } = await admin
      .from('orders')
      .update({ 
        invoice_generated: false,
        invoice_data: null,
        invoice_url: null
      })
      .eq('id', orderId)
    
    if (error) {
      console.error('Error resetting invoice state:', error)
      throw new Error(error.message)
    }

    revalidatePath('/admin/invoices')
    revalidatePath('/admin/orders')
    
    console.log(`Successfully reset invoice for order: ${orderId}`)
    return { success: true }
  } catch (err: any) {
    console.error('Critical error in deleteInvoiceAction:', err)
    throw err
  }
}
