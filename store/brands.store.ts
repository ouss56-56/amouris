'use client'
import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'

export interface Brand {
  id: string
  name: string
  name_ar: string
  logo_url: string | null
  description_fr: string
}

interface BrandsStore {
  brands: Brand[]
  isLoading: boolean
  error: string | null
  fetchBrands: () => Promise<void>
  addBrand: (b: Omit<Brand, 'id'>) => Promise<void>
  updateBrand: (id: string, updates: Partial<Brand>) => Promise<void>
  deleteBrand: (id: string) => Promise<void>
  
  // Aliases for compatibility
  add: (b: Omit<Brand, 'id'>) => Promise<void>
  update: (id: string, updates: Partial<Brand>) => Promise<void>
  remove: (id: string) => Promise<void>
}

const supabase = createClient()

export const useBrandsStore = create<BrandsStore>((set, get) => ({
  brands: [],
  isLoading: false,
  error: null,

  fetchBrands: async () => {
    set({ isLoading: true })
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .order('name')
    
    if (error) set({ error: error.message, isLoading: false })
    else set({ brands: data || [], isLoading: false })
  },

  addBrand: async (brand) => {
    set({ isLoading: true })
    const { data, error } = await supabase
      .from('brands')
      .insert([brand])
      .select()
      .single()
    
    if (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
    set(s => ({ brands: [...s.brands, data], isLoading: false }))
  },

  updateBrand: async (id, updates) => {
    set({ isLoading: true })
    const { error } = await supabase
      .from('brands')
      .update(updates)
      .eq('id', id)
    
    if (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
    set(s => ({
      brands: s.brands.map(b => b.id === id ? { ...b, ...updates } : b),
      isLoading: false
    }))
  },

  deleteBrand: async (id) => {
    set({ isLoading: true })
    const { error } = await supabase
      .from('brands')
      .delete()
      .eq('id', id)
    
    if (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
    set(s => ({ brands: s.brands.filter(b => b.id !== id), isLoading: false }))
  },

  add: (b) => get().addBrand(b),
  update: (id, u) => get().updateBrand(id, u),
  remove: (id) => get().deleteBrand(id),
}))
