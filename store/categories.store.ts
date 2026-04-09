'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createClient } from '@/lib/supabase/client'
import { productsApi } from '@/lib/api/products.api'

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
  lastUpdated: number | null
  fetchCategories: (force?: boolean) => Promise<void>
  addCategory: (c: Omit<Category, 'id'>) => Promise<void>
  update: (id: string, updates: Partial<Category>) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
  seed: (categories: Category[]) => void
}

const CACHE_DURATION = 5 * 60 * 1000

export const useCategoriesStore = create<CategoriesStore>()(
  persist(
    (set, get) => ({
      categories: [],
      isLoading: false,
      error: null,
      lastUpdated: null,

      fetchCategories: async (force = false) => {
        const { lastUpdated, categories } = get()
        const now = Date.now()

        if (!force && lastUpdated && now - lastUpdated < CACHE_DURATION && categories.length > 0) {
          return
        }

        set({ isLoading: true, error: null })
        try {
          const data = await productsApi.fetchCategories()
          set({ categories: data || [], lastUpdated: now, isLoading: false })
        } catch (err: any) {
          set({ error: err.message, isLoading: false })
        }
      },

      addCategory: async (category) => {
        set({ isLoading: true })
        try {
          const supabase = createClient()
          const { data, error } = await supabase.from('categories').insert([category]).select().single()
          if (error) throw error
          set(s => ({ categories: [...s.categories, data], isLoading: false }))
        } catch (err: any) {
          set({ error: err.message, isLoading: false })
          throw err
        }
      },

      update: async (id, updates) => {
        set({ isLoading: true })
        try {
          const supabase = createClient()
          const { error } = await supabase.from('categories').update(updates).eq('id', id)
          if (error) throw error
          set(s => ({
            categories: s.categories.map(c => c.id === id ? { ...c, ...updates } : c),
            isLoading: false
          }))
        } catch (err: any) {
          set({ error: err.message, isLoading: false })
          throw err
        }
      },

      deleteCategory: async (id) => {
        set({ isLoading: true })
        try {
          const supabase = createClient()
          const { error } = await supabase.from('categories').delete().eq('id', id)
          if (error) throw error
          set(s => ({ categories: s.categories.filter(c => c.id !== id), isLoading: false }))
        } catch (err: any) {
          set({ error: err.message, isLoading: false })
          throw err
        }
      },

      seed: (categories) => set({ categories, lastUpdated: Date.now() })
    }),
    { name: 'amouris_categories_cache' }
  )
)
