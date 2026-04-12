'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function createOrderAction(orderData: {
  customer_id: string | null
  is_registered_customer: boolean
  guest_first_name?: string
  guest_last_name?: string
  guest_phone?: string
  guest_wilaya?: string
  guest_commune?: string
  items: Array<{
    product_id: string
    product_type: string
    product_name_fr: string
    product_name_ar: string
    flacon_variant_id: string | null
    variant_label: string | null
    unit_price: number
    quantity_grams: number | null
    quantity_units: number | null
    total_price: number
  }>
  total_amount: number
}) {
  const supabase = await createClient()

  // Insérer la commande (le trigger génère order_number automatiquement)
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_id: orderData.customer_id,
      is_registered_customer: orderData.is_registered_customer,
      guest_first_name: orderData.guest_first_name ?? null,
      guest_last_name: orderData.guest_last_name ?? null,
      guest_phone: orderData.guest_phone ?? null,
      guest_wilaya: orderData.guest_wilaya ?? null,
      guest_commune: orderData.guest_commune ?? null,
      total_amount: orderData.total_amount,
    })
    .select('id, order_number')
    .single()

  if (orderError) {
    console.error('Order creation error:', orderError)
    throw new Error(orderError.message)
  }

  // Insérer les articles
  const { error: itemsError } = await supabase.from('order_items').insert(
    orderData.items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      product_type: item.product_type,
      product_name_fr: item.product_name_fr,
      product_name_ar: item.product_name_ar,
      flacon_variant_id: item.flacon_variant_id ?? null,
      variant_label: item.variant_label ?? null,
      unit_price: item.unit_price,
      quantity_grams: item.quantity_grams ?? null,
      quantity_units: item.quantity_units ?? null,
      total_price: item.total_price,
    }))
  )

  if (itemsError) {
    console.error('Order items error:', itemsError)
    throw new Error(itemsError.message)
  }

  // Déduire le stock
  const adminClient = createAdminClient()
  for (const item of orderData.items) {
    if (item.product_type === 'perfume' && item.quantity_grams) {
      await adminClient.rpc('deduct_stock_grams', {
        p_product_id: item.product_id,
        p_grams: item.quantity_grams,
      })
    } else if (item.flacon_variant_id && item.quantity_units) {
      await adminClient.rpc('deduct_variant_stock', {
        p_variant_id: item.flacon_variant_id,
        p_units: item.quantity_units,
      })
    }
  }

  revalidatePath('/admin/orders')

  return { success: true, orderNumber: order.order_number }
}

export async function updateOrderStatusAction(id: string, status: string) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('orders')
    .update({ order_status: status })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/orders')
  return { success: true }
}

export async function updateOrderPaymentAction(id: string, amountPaid: number) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('orders')
    .update({ amount_paid: amountPaid })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/orders')
  return { success: true }
}

export async function deleteOrderAction(id: string) {
  const supabase = createAdminClient()
  
  // 1. Delete order (Cascade deletes handled in DB: order_items, status_history)
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting order:', error)
    throw new Error(`Échec de la suppression de la commande: ${error.message}`)
  }

  revalidatePath('/admin/orders')
  revalidatePath('/admin/invoices')
  revalidatePath('/admin')
  
  return { success: true }
}
