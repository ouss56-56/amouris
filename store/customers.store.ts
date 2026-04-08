'use client'
import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'

export interface Customer {
  id: string
  first_name: string
  last_name: string
  phone: string
  shop_name?: string
  wilaya: string
  commune?: string
  password?: string // We'll store it in profiles for this demo/B2B context
  is_frozen: boolean
  created_at: string
}

interface CustomersStore {
  customers: Customer[]
  isLoading: boolean
  error: string | null
  fetchCustomers: () => Promise<void>
  register: (data: any) => Promise<{ ok: boolean; customer?: Customer; error?: string }>
  login: (phone: string, password: string) => Promise<{ ok: boolean; customer?: Customer; error?: string }>
  freeze: (id: string) => Promise<void>
  unfreeze: (id: string) => Promise<void>
  remove: (id: string) => Promise<void>
  resetPassword: (id: string, newPassword: string) => Promise<void>
  getById: (id: string) => Customer | undefined
}

const supabase = createClient()

function normalizePhone(p: string) {
  return p.replace(/[\s\-\.]/g, '').trim()
}

export const useCustomersStore = create<CustomersStore>((set, get) => ({
  customers: [],
  isLoading: false,
  error: null,

  fetchCustomers: async () => {
    set({ isLoading: true })
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) set({ error: error.message, isLoading: false })
    else set({ customers: data || [], isLoading: false })
  },

  register: async (data) => {
    set({ isLoading: true })
    const phone = normalizePhone(data.phone)
    
    // Check if exists
    const { data: existing } = await supabase.from('profiles').select('id').eq('phone', phone).single()
    if (existing) {
      set({ isLoading: false })
      return { ok: false, error: 'Un compte avec ce numéro existe déjà' }
    }

    const customerData = {
      first_name: data.first_name,
      last_name: data.last_name,
      phone,
      shop_name: data.shop_name,
      wilaya: data.wilaya,
      commune: data.commune,
      // In a real app, we'd use Supabase Auth. 
      // For this "pure store" approach, we store it in profiles if needed or just handle it here.
      // We'll follow the user's lead from the previous persistent store.
      // Note: This requires a 'password' or 'password_hash' column in 'profiles'.
      password: data.password, 
      is_frozen: false,
    }

    const { data: newCust, error } = await supabase
      .from('profiles')
      .insert([customerData])
      .select()
      .single()

    if (error) {
      set({ error: error.message, isLoading: false })
      return { ok: false, error: error.message }
    }

    set(s => ({ customers: [newCust, ...s.customers], isLoading: false }))
    return { ok: true, customer: newCust }
  },

  login: async (phone, password) => {
    const p = normalizePhone(phone)
    const { data: found, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('phone', p)
      .eq('password', password)
      .single()
    
    if (error || !found) return { ok: false, error: 'Numéro ou mot de passe incorrect' }
    if (found.is_frozen) return { ok: false, error: 'Ce compte est suspendu' }
    
    return { ok: true, customer: found }
  },

  freeze: async (id) => {
    set({ isLoading: true })
    await supabase.from('profiles').update({ is_frozen: true }).eq('id', id)
    set(s => ({
      customers: s.customers.map(c => c.id === id ? { ...c, is_frozen: true } : c),
      isLoading: false
    }))
  },

  unfreeze: async (id) => {
    set({ isLoading: true })
    await supabase.from('profiles').update({ is_frozen: false }).eq('id', id)
    set(s => ({
      customers: s.customers.map(c => c.id === id ? { ...c, is_frozen: false } : c),
      isLoading: false
    }))
  },

  remove: async (id) => {
    set({ isLoading: true })
    await supabase.from('profiles').delete().eq('id', id)
    set(s => ({ customers: s.customers.filter(c => c.id !== id), isLoading: false }))
  },

  resetPassword: async (id, pwd) => {
    set({ isLoading: true })
    await supabase.from('profiles').update({ password: pwd }).eq('id', id)
    set(s => ({
      customers: s.customers.map(c => c.id === id ? { ...c, password: pwd } : c),
      isLoading: false
    }))
  },

  getById: (id) => get().customers.find(c => c.id === id),
}))
