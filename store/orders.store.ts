'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createClient } from '@/lib/supabase/client'
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
  invoiceCounter: number
  isLoading: boolean
  error: string | null
  createOrder: (data: Partial<Order>) => Order
  updateStatus: (id: string, status: OrderStatus, note?: string) => void
  updatePayment: (id: string, amountPaid: number) => void
  updateNotes: (id: string, notes: string) => void
  updateInvoiceData: (id: string, data: InvoiceData) => void
  generateInvoiceNumber: () => string
  generateInvoice: (id: string) => void
  getByCustomer: (customerId: string) => Order[]
}

export const useOrdersStore = create<OrdersStore>()(
  persist(
    (set, get) => ({
      orders: [],
      invoiceCounter: 1,
      isLoading: false,
      error: null,

      createOrder: (data) => {
        const order_number = `AM-${Math.floor(100000 + Math.random() * 900000)}` // Simplistic for client-only
        const newOrder: Order = {
          id: crypto.randomUUID(),
          order_number,
          customer_id: data.customer_id || null,
          is_registered_customer: !!data.customer_id,
          guest_first_name: data.guest_first_name || null,
          guest_last_name: data.guest_last_name || null,
          guest_phone: data.guest_phone || null,
          guest_wilaya: data.guest_wilaya || null,
          guest_commune: data.guest_commune || null,
          items: data.items || [],
          total_amount: data.total_amount || 0,
          amount_paid: 0,
          payment_status: 'unpaid',
          order_status: 'pending',
          status_history: [{ status: 'pending', changed_at: new Date().toISOString() }],
          admin_notes: '',
          invoice_generated: false,
          invoice_data: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        set((state) => ({ orders: [newOrder, ...state.orders] }))
        return newOrder
      },

      updateStatus: (id, status, note) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === id
              ? {
                  ...o,
                  order_status: status,
                  status_history: [
                    ...o.status_history,
                    { status, changed_at: new Date().toISOString(), note },
                  ],
                  updated_at: new Date().toISOString(),
                }
              : o
          ),
        }))
      },

      updatePayment: (id, amountPaid) => {
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
      },

      updateNotes: (id, notes) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === id ? { ...o, admin_notes: notes, updated_at: new Date().toISOString() } : o
          ),
        }))
      },

      updateInvoiceData: (id, data) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === id ? { ...o, invoice_data: data, invoice_generated: true, updated_at: new Date().toISOString() } : o
          ),
        }))
      },

      generateInvoice: (id) => {
        const order = get().orders.find((o) => o.id === id)
        if (!order) return

        const settings = useSettingsStore.getState()
        const invoice_number = get().generateInvoiceNumber()

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
          client_shop: '', // Could be fetched if registered
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

        get().updateInvoiceData(id, invoice_data)
      },

      getByCustomer: (customerId: string) => {
        return get().orders.filter((o) => o.customer_id === customerId)
      },
    }),
    { name: 'amouris-orders' }
)
)
