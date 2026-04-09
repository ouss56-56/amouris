'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createClient } from '@/lib/supabase/client'
import { authApi } from '@/lib/api/auth.api'

export interface Customer {
  id: string
  first_name: string
  last_name: string
  phone: string
  phone_number: string // alias for UI
  shop_name?: string
  wilaya: string
  commune?: string
  password?: string
  is_frozen: boolean
  status: 'active' | 'frozen' // alias for UI
  role?: string
  created_at: string
}

interface CustomersStore {
  customers: Customer[]
  isLoading: boolean
  error: string | null
  lastUpdated: number | null
  fetchCustomers: (force?: boolean) => Promise<void>
  register: (data: any) => Promise<{ ok: boolean; customer?: Customer; error?: string }>
  freeze: (id: string) => Promise<void>
  unfreeze: (id: string) => Promise<void>
  toggleFreeze: (id: string) => Promise<void>
  remove: (id: string) => Promise<void>
  resetPassword: (id: string, newPassword: string) => Promise<void>
  update: (id: string, updates: Partial<Customer>) => Promise<{ ok: boolean; customer?: Customer; error?: string }>
  getById: (id: string) => Customer | undefined
}

const CACHE_DURATION = 5 * 60 * 1000

export const useCustomersStore = create<CustomersStore>()(
  persist(
    (set, get) => ({
      customers: [],
      isLoading: false,
      error: null,
      lastUpdated: null,

      fetchCustomers: async (force = false) => {
        const { lastUpdated, customers } = get()
        const now = Date.now()

        if (!force && lastUpdated && now - lastUpdated < CACHE_DURATION && customers.length > 0) {
          return
        }

        set({ isLoading: true, error: null })
        try {
          const supabase = createClient()
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'customer')
            .order('created_at', { ascending: false })
          
          if (error) throw error
          
          const transformed = (data || []).map(c => ({
            ...c,
            phone_number: c.phone,
            status: c.is_frozen ? 'frozen' : 'active'
          }))
          
          set({ customers: transformed, lastUpdated: now, isLoading: false })
        } catch (err: any) {
          set({ error: err.message, isLoading: false })
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null })
        try {
          const user = await authApi.registerCustomer(data)
          // Fetch the newly created profile
          const supabase = createClient()
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

          if (error) throw error

          set(s => ({ 
            customers: [profile as Customer, ...s.customers], 
            isLoading: false 
          }))
          return { ok: true, customer: profile as Customer }
        } catch (err: any) {
          set({ error: err.message, isLoading: false })
          return { ok: false, error: err.message }
        }
      },

      freeze: async (id) => {
        set({ isLoading: true })
        const supabase = createClient()
        const { error } = await supabase.from('profiles').update({ is_frozen: true }).eq('id', id)
        if (error) {
          set({ error: error.message, isLoading: false })
          return
        }
        set(s => ({
          customers: s.customers.map(c => c.id === id ? { ...c, is_frozen: true, status: 'frozen' } : c),
          isLoading: false
        }))
      },

      unfreeze: async (id) => {
        set({ isLoading: true })
        const supabase = createClient()
        const { error } = await supabase.from('profiles').update({ is_frozen: false }).eq('id', id)
        if (error) {
          set({ error: error.message, isLoading: false })
          return
        }
        set(s => ({
          customers: s.customers.map(c => c.id === id ? { ...c, is_frozen: false, status: 'active' } : c),
          isLoading: false
        }))
      },

      toggleFreeze: async (id) => {
        const customer = get().customers.find(c => c.id === id)
        if (!customer) return
        if (customer.is_frozen) {
          return get().unfreeze(id)
        } else {
          return get().freeze(id)
        }
      },

      remove: async (id) => {
        set({ isLoading: true })
        const supabase = createClient()
        const { error } = await supabase.from('profiles').delete().eq('id', id)
        if (error) {
          set({ error: error.message, isLoading: false })
          return
        }
        set(s => ({ customers: s.customers.filter(c => c.id !== id), isLoading: false }))
      },

      resetPassword: async (id, pwd) => {
        // Note: Resetting password for Supabase Auth users should be done via Auth API
        // For this B2B context, we can use the service role client if needed, 
        // but for now we'll just log an error or implement a placeholder.
        console.warn('Reset password not implemented with Supabase Auth yet')
      },

      update: async (id, updates) => {
        set({ isLoading: true, error: null })
        try {
          const supabase = createClient()
          const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

          if (error) throw error

          set(s => ({
            customers: s.customers.map(c => c.id === id ? { ...c, ...data } : c),
            isLoading: false
          }))
          
          return { ok: true, customer: data as Customer }
        } catch (err: any) {
          console.error('Error updating customer:', err)
          set({ error: err.message, isLoading: false })
          return { ok: false, error: err.message }
        }
      },

      getById: (id) => get().customers.find(c => c.id === id),
    }),
    {
      name: 'amouris_customers_cache',
    }
  )
)
