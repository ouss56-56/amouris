'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createClient } from '@/lib/supabase/client'
import { useProductsStore } from './products.store'

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled'
export type PaymentStatus = 'unpaid' | 'partial' | 'paid'

export interface OrderItem {
  id?: string
  product_id: string
  flacon_variant_id: string | null
  product_name_fr: string
  product_name_ar: string
  quantity_grams: number | null
  quantity_units: number | null
  unit_price: number
  total_price: number
}

export interface Order {
  id: string
  order_number: string
  customer_id: string | null
  guest_first_name?: string
  guest_last_name?: string
  guest_phone?: string
  guest_wilaya?: string
  items: OrderItem[]
  total_amount: number
  amount_paid: number
  payment_status: PaymentStatus
  order_status: OrderStatus
  admin_notes: string
  invoice_url: string | null
  created_at: string
  updated_at: string
}

interface OrdersStore {
  orders: Order[]
  isLoading: boolean
  error: string | null
  fetchOrders: () => Promise<void>
  createOrder: (data: any) => Promise<Order>
  updateStatus: (id: string, status: OrderStatus) => Promise<void>
  updatePayment: (id: string, amountPaid: number) => Promise<void>
  updateNotes: (id: string, notes: string) => Promise<void>
  setInvoiceUrl: (id: string, url: string) => Promise<void>
  getByCustomer: (customerId: string) => Order[]
}

const supabase = createClient()

export const useOrdersStore = create<OrdersStore>()(
  persist(
    (set, get) => ({
      orders: [],
      isLoading: false,
      error: null,

  fetchOrders: async () => {
    set({ isLoading: true })
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false })
    
    if (error) {
      set({ error: error.message, isLoading: false })
    } else {
      const mapped = data.map((o: any) => ({
        ...o,
        items: o.order_items || []
      }))
      set({ orders: mapped, isLoading: false })
    }
  },

  createOrder: async (data) => {
    set({ isLoading: true })
    const { items, ...orderData } = data
    
    // 1. Get next order number
    const { data: nextNum } = await supabase.rpc('next_order_number')
    const order_number = `AM-${String(nextNum || Date.now()).padStart(6, '0')}`

    // 2. Insert order
    const { data: order, error } = await supabase
      .from('orders')
      .insert([{ ...orderData, order_number }])
      .select()
      .single()
    
    if (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }

    // 3. Insert items and update inventory
    if (items?.length) {
      const itemInserts = items.map((i: any) => ({ ...i, order_id: order.id }))
      await supabase.from('order_items').insert(itemInserts)

      // Deduct inventory
      for (const item of items) {
        if (item.quantity_grams) {
          await useProductsStore.getState().updateStockGrams(item.product_id, -item.quantity_grams)
        } else if (item.quantity_units && item.flacon_variant_id) {
          await useProductsStore.getState().updateVariantStock(item.product_id, item.flacon_variant_id, -item.quantity_units)
        }
      }
    }

    const { data: fullOrder } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', order.id)
      .single()

    const mapped = { ...fullOrder, items: fullOrder.order_items || [] }
    set(s => ({ orders: [mapped, ...s.orders], isLoading: false }))
    return mapped
  },

  updateStatus: async (id, status) => {
    set({ isLoading: true })
    const oldOrder = get().orders.find(o => o.id === id)
    const oldStatus = oldOrder?.order_status

    const { error } = await supabase.from('orders').update({ order_status: status }).eq('id', id)
    if (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }

    // Handle inventory restoration if cancelled
    if (status === 'cancelled' && oldStatus !== 'cancelled' && oldOrder) {
      for (const item of oldOrder.items) {
        if (item.quantity_grams) {
          await useProductsStore.getState().updateStockGrams(item.product_id, item.quantity_grams)
        } else if (item.quantity_units && item.flacon_variant_id) {
          await useProductsStore.getState().updateVariantStock(item.product_id, item.flacon_variant_id, item.quantity_units)
        }
      }
    }

    await get().fetchOrders()
  },

  updatePayment: async (id, amountPaid) => {
    set({ isLoading: true })
    const o = get().orders.find(x => x.id === id)
    if (!o) return

    const ps: PaymentStatus =
      amountPaid <= 0 ? 'unpaid'
      : amountPaid >= o.total_amount ? 'paid'
      : 'partial'

    const { error } = await supabase
      .from('orders')
      .update({ amount_paid: amountPaid, payment_status: ps })
      .eq('id', id)
    
    if (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
    await get().fetchOrders()
  },

  updateNotes: async (id, notes) => {
    set({ isLoading: true })
    const { error } = await supabase.from('orders').update({ admin_notes: notes }).eq('id', id)
    if (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
    await get().fetchOrders()
  },

  setInvoiceUrl: async (id, url) => {
    set({ isLoading: true })
    const { error } = await supabase.from('orders').update({ invoice_url: url }).eq('id', id)
    if (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
    await get().fetchOrders()
  },
  getByCustomer: (customerId: string) => {
    return get().orders.filter(o => o.customer_id === customerId)
  }
}), { name: 'amouris-orders' })
)
