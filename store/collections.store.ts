'use client'
import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'

export interface Collection {
  id: string
  name_fr: string
  name_ar: string
  description_fr: string
  cover_url: string | null
}

interface CollectionsStore {
  collections: Collection[]
  isLoading: boolean
  error: string | null
  fetchCollections: () => Promise<void>
  addCollection: (c: Omit<Collection, 'id'>) => Promise<void>
  updateCollection: (id: string, updates: Partial<Collection>) => Promise<void>
  deleteCollection: (id: string) => Promise<void>
  
  // Aliases for compatibility
  add: (c: Omit<Collection, 'id'>) => Promise<void>
  update: (id: string, updates: Partial<Collection>) => Promise<void>
  remove: (id: string) => Promise<void>
}

const supabase = createClient()

export const useCollectionsStore = create<CollectionsStore>((set, get) => ({
  collections: [],
  isLoading: false,
  error: null,

  fetchCollections: async () => {
    set({ isLoading: true })
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .order('name_fr')
    
    if (error) set({ error: error.message, isLoading: false })
    else {
      const mapped = data?.map((c: any) => ({
        ...c,
        cover_url: c.cover_image // Mapping DB column to store property
      })) || []
      set({ collections: mapped, isLoading: false })
    }
  },

  addCollection: async (collection) => {
    set({ isLoading: true })
    const { cover_url, ...rest } = collection
    const dbData = { ...rest, cover_image: cover_url }
    
    const { data, error } = await supabase
      .from('collections')
      .insert([dbData])
      .select()
      .single()
    
    if (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
    const mapped = { ...data, cover_url: data.cover_image }
    set(s => ({ collections: [...s.collections, mapped], isLoading: false }))
  },

  updateCollection: async (id, updates) => {
    set({ isLoading: true })
    const { cover_url, ...rest } = updates as any
    const dbData = { ...rest }
    if (cover_url !== undefined) dbData.cover_image = cover_url

    const { error } = await supabase
      .from('collections')
      .update(dbData)
      .eq('id', id)
    
    if (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
    set(s => ({
      collections: s.collections.map(c => c.id === id ? { ...c, ...updates } : c),
      isLoading: false
    }))
  },

  deleteCollection: async (id) => {
    set({ isLoading: true })
    const { error } = await supabase
      .from('collections')
      .delete()
      .eq('id', id)
    
    if (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
    set(s => ({ collections: s.collections.filter(c => c.id !== id), isLoading: false }))
  },

  add: (c) => get().addCollection(c),
  update: (id, u) => get().updateCollection(id, u),
  remove: (id) => get().deleteCollection(id),
}))
