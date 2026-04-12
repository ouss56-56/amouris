'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function deleteInvoiceAction(invoiceId: string) {
  const admin = createAdminClient()
  
  // 1. Get the invoice to find the storage path if needed
  const { data: invoice } = await admin
    .from('invoices')
    .select('pdf_url')
    .eq('id', invoiceId)
    .single()

  // 2. Delete from database
  const { error } = await admin
    .from('invoices')
    .delete()
    .eq('id', invoiceId)
  
  if (error) {
    console.error('Error deleting invoice:', error)
    throw new Error(error.message)
  }

  // 3. Optional: Delete the PDF from storage if it exists
  if (invoice?.pdf_url) {
    try {
      const urlObj = new URL(invoice.pdf_url)
      const path = urlObj.pathname.split('/storage/v1/object/public/invoices/')[1]
      if (path) {
        await admin.storage.from('invoices').remove([path])
      }
    } catch (e) {
      console.warn('Failed to delete PDF from storage:', e)
    }
  }

  revalidatePath('/admin/invoices')
  revalidatePath('/admin/orders')
  return { success: true }
}
