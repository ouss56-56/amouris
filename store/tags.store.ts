'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Tag } from '@/lib/types'

interface TagsStore {
  tags: Tag[]
  _seeded: boolean
  seed: (data: Tag[]) => void
  add: (t: Tag) => void
  update: (id: string, updates: Partial<Tag>) => void
  remove: (id: string) => void
  getHomepageTags: () => Tag[]
}

export const useTagsStore = create<TagsStore>()(
  persist(
    (set, get) => ({
      tags: [],
      _seeded: false,
      seed: (data) => { if (!get()._seeded) set({ tags: data, _seeded: true }) },
      add: (t) => set(s => ({ tags: [...s.tags, t] })),
      update: (id, u) => set(s => ({ tags: s.tags.map(t => t.id === id ? { ...t, ...u } : t) })),
      remove: (id) => set(s => ({ tags: s.tags.filter(t => t.id !== id) })),
      getHomepageTags: () =>
        get().tags
          .filter(t => t.showOnHomepage)
          .sort((a, b) => (a.homepageOrder || 0) - (b.homepageOrder || 0)),
    }),
    { name: 'amouris_tags' }
  )
)
