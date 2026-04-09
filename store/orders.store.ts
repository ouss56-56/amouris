'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createClient } from '@/lib/supabase/client'
import { ordersApi } from '@/lib/api/orders.api'
import { useProductsStore } from './products.store'
import { useSettingsStore } from './settings.store'

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled'
export type PaymentStatus = 'unpaid' | 'partial' | 'paid'

export interface StatusHistoryEntry {
  status: OrderStatus
  changed_at: string
  note?: string
}

export interface InvoiceData {
  invoice_number: string
  generated_at: string
  shop_name: string
  shop_address: string
  shop_phone: string
  shop_email: string
  order_number: string
  order_date: string
  client_name: string
  client_shop: string
  client_phone: string
  client_wilaya: string
  client_commune: string
  is_registered: boolean
  items: {
    description: string
    quantity: string
    unit_price: number
    total: number
  }[]
  subtotal: number
  total: number
  amount_paid: number
  remaining: number
  payment_status: string
}

export interface OrderItem {
  id?: string
  product_id: string
  product_type: 'perfume' | 'flacon'
  flacon_variant_id: string | null
  product_name_fr: string
  product_name_ar: string
  variant_label: string | null
  quantity_grams: number | null
  quantity_units: number | null
  unit_price: number
  total_price: number
}

export interface Order {
  id: string
  order_number: string
  customer_id: string | null
  is_registered_customer: boolean
  guest_first_name: string | null
  guest_last_name: string | null
  guest_phone: string | null
  guest_wilaya: string | null
  guest_commune: string | null
  items: OrderItem[]
  total_amount: number
  amount_paid: number
  payment_status: PaymentStatus
  order_status: OrderStatus
  status_history: StatusHistoryEntry[]
  admin_notes: string
  invoice_generated: boolean
  invoice_data: InvoiceData | null
  created_at: string
  updated_at: string
}

interface OrdersStore {
  orders: Order[]
  isLoading: boolean
  error: string | null
  lastUpdated: number | null
  fetchOrders: (force?: boolean) => Promise<void>
  createOrder: (data: Partial<Order>) => Promise<Order>
  updateStatus: (id: string, status: OrderStatus, note?: string) => Promise<void>
  updatePayment: (id: string, amountPaid: number) => Promise<void>
  updateNotes: (id: string, notes: string) => Promise<void>
  generateInvoice: (id: string) => Promise<void>
  getByCustomer: (customerId: string) => Order[]
  getAll: () => Order[]
}

const CACHE_DURATION = 5 * 60 * 1000

export const useOrdersStore = create<OrdersStore>()(
  persist(
    (set, get) => ({
      orders: [],
      isLoading: false,
      error: null,
      lastUpdated: null,

      fetchOrders: async (force = false) => {
        const { lastUpdated, orders } = get()
        const now = Date.now()

        if (!force && lastUpdated && now - lastUpdated < CACHE_DURATION && orders.length > 0) {
          return
        }

        set({ isLoading: true, error: null })
        try {
          const fetchedOrders = await ordersApi.fetchAllOrders()
          set({ orders: fetchedOrders, lastUpdated: now, isLoading: false })
        } catch (err: any) {
          set({ error: err.message, isLoading: false })
        }
      },

      createOrder: async (data) => {
        set({ isLoading: true, error: null })
        try {
          const newOrder = await ordersApi.createOrder(data)
          set((state) => ({ 
            orders: [newOrder, ...state.orders],
            isLoading: false
          }))
          return newOrder
        } catch (err: any) {
          set({ error: err.message, isLoading: false })
          throw err
        }
      },

      updateStatus: async (id, status, note) => {
        try {
          await ordersApi.updateOrderStatus(id, status, note)
          set((state) => ({
            orders: state.orders.map((o) =>
              o.id === id
                ? {
                    ...o,
                    order_status: status,
                    status_history: [
                      ...o.status_history,
                      { status, changed_at: new Date().toISOString(), note } as StatusHistoryEntry,
                    ],
                    updated_at: new Date().toISOString(),
                  }
                : o
            ),
          }))
        } catch (err: any) {
          console.error('Failed to update status:', err)
        }
      },

      updatePayment: async (id, amountPaid) => {
        try {
          await ordersApi.updateOrderPayment(id, amountPaid)
          set((state) => ({
            orders: state.orders.map((o) => {
              if (o.id !== id) return o
              const ps: PaymentStatus =
                amountPaid <= 0 ? 'unpaid' : amountPaid >= o.total_amount ? 'paid' : 'partial'
              return {
                ...o,
                amount_paid: amountPaid,
                payment_status: ps,
                updated_at: new Date().toISOString(),
              }
            }),
          }))
        } catch (err: any) {
          console.error('Failed to update payment:', err)
        }
      },

      updateNotes: async (id, notes) => {
        try {
          await ordersApi.updateAdminNotes(id, notes)
          set((state) => ({
            orders: state.orders.map((o) =>
              o.id === id ? { ...o, admin_notes: notes, updated_at: new Date().toISOString() } : o
            ),
          }))
        } catch (err: any) {
          console.error('Failed to update notes:', err)
        }
      },

      generateInvoice: async (id) => {
        const order = get().orders.find((o) => o.id === id)
        if (!order) return

        const settings = useSettingsStore.getState()
        const invoice_number = `FAC-${Math.floor(Math.random() * 900000) + 100000}`

        const invoice_data: InvoiceData = {
          invoice_number,
          generated_at: new Date().toISOString(),
          shop_name: settings.shopName || 'AMOURIS PARFUMS',
          shop_address: settings.address || 'Alger, Algérie',
          shop_phone: settings.phoneNumber || '',
          shop_email: settings.email || '',
          order_number: order.order_number,
          order_date: new Date(order.created_at).toLocaleDateString(),
          client_name: order.is_registered_customer ? 'Client Enregistré' : `${order.guest_first_name} ${order.guest_last_name}`,
          client_shop: '',
          client_phone: order.guest_phone || '',
          client_wilaya: order.guest_wilaya || '',
          client_commune: order.guest_commune || '',
          is_registered: order.is_registered_customer,
          items: order.items.map((i) => ({
            description: `${i.product_name_fr}${i.variant_label ? ` - ${i.variant_label}` : ''}`,
            quantity: i.quantity_grams ? `${i.quantity_grams}g` : `${i.quantity_units}x`,
            unit_price: i.unit_price,
            total: i.total_price,
          })),
          subtotal: order.total_amount,
          total: order.total_amount,
          amount_paid: order.amount_paid,
          remaining: order.total_amount - order.amount_paid,
          payment_status: order.payment_status,
        }

        try {
          await ordersApi.generateInvoice(id, invoice_data)
          set((state) => ({
            orders: state.orders.map((o) =>
              o.id === id ? { ...o, invoice_data: invoice_data, invoice_generated: true, updated_at: new Date().toISOString() } : o
            ),
          }))
        } catch (err: any) {
          console.error('Failed to generate invoice:', err)
        }
      },

      getByCustomer: (customerId: string) => {
        return get().orders.filter((o) => o.customer_id === customerId)
      },

      getAll: () => {
        return [...get().orders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      },
    }),
    {
      name: 'amouris-orders-storage',
    }
  )
)
