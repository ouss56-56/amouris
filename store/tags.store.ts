'use client'
import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'

export interface Tag {
  id: string
  name_fr: string
  name_ar: string
  slug: string
  show_on_homepage: boolean
  homepage_order: number
}

interface TagsStore {
  tags: Tag[]
  isLoading: boolean
  error: string | null
  fetchTags: () => Promise<void>
  addTag: (t: Omit<Tag, 'id'>) => Promise<void>
  updateTag: (id: string, updates: Partial<Tag>) => Promise<void>
  deleteTag: (id: string) => Promise<void>
  getHomepageTags: () => Tag[]
}

const supabase = createClient()

export const useTagsStore = create<TagsStore>((set, get) => ({
  tags: [],
  isLoading: false,
  error: null,

  fetchTags: async () => {
    set({ isLoading: true })
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('homepage_order', { ascending: true })
    
    if (error) set({ error: error.message, isLoading: false })
    else set({ tags: data || [], isLoading: false })
  },

  addTag: async (tag) => {
    set({ isLoading: true })
    const { data, error } = await supabase
      .from('tags')
      .insert([tag])
      .select()
      .single()
    
    if (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
    set(s => ({ tags: [...s.tags, data], isLoading: false }))
  },

  updateTag: async (id, updates) => {
    set({ isLoading: true })
    const { error } = await supabase
      .from('tags')
      .update(updates)
      .eq('id', id)
    
    if (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
    set(s => ({
      tags: s.tags.map(t => t.id === id ? { ...t, ...updates } : t),
      isLoading: false
    }))
  },

  deleteTag: async (id) => {
    set({ isLoading: true })
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', id)
    
    if (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
    set(s => ({ tags: s.tags.filter(t => t.id !== id), isLoading: false }))
  },

  getHomepageTags: () => {
    return get().tags
      .filter(t => t.show_on_homepage)
      .sort((a, b) => (a.homepage_order || 0) - (b.homepage_order || 0))
  }
}))
