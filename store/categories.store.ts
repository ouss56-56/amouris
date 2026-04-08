'use client'
import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'

export interface Category {
  id: string
  name_fr: string
  name_ar: string
  slug: string
  image_url?: string | null
}

interface CategoriesStore {
  categories: Category[]
  isLoading: boolean
  error: string | null
  fetchCategories: () => Promise<void>
  addCategory: (c: Omit<Category, 'id'>) => Promise<void>
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
  // Legacy compatibility
  add: (c: Omit<Category, 'id'>) => Promise<void>
  update: (id: string, updates: Partial<Category>) => Promise<void>
  remove: (id: string) => Promise<void>
}

const supabase = createClient()

export const useCategoriesStore = create<CategoriesStore>((set, get) => ({
  categories: [],
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    set({ isLoading: true })
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name_fr')
    
    if (error) set({ error: error.message, isLoading: false })
    else set({ categories: data || [], isLoading: false })
  },

  addCategory: async (category) => {
    set({ isLoading: true })
    const { data, error } = await supabase
      .from('categories')
      .insert([category])
      .select()
      .single()
    
    if (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
    set(s => ({ categories: [...s.categories, data], isLoading: false }))
  },

  updateCategory: async (id, updates) => {
    set({ isLoading: true })
    const { error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
    
    if (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
    set(s => ({
      categories: s.categories.map(c => c.id === id ? { ...c, ...updates } : c),
      isLoading: false
    }))
  },

  deleteCategory: async (id) => {
    set({ isLoading: true })
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
    
    if (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
    set(s => ({ categories: s.categories.filter(c => c.id !== id), isLoading: false }))
  },

  // Legacy compatibility aliases
  add: (c) => get().addCategory(c),
  update: (id, u) => get().updateCategory(id, u),
  remove: (id) => get().deleteCategory(id),
}))
