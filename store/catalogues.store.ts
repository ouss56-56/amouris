'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CatalogueFile {
  id: string
  type: 'parfums' | 'flacons'
  filename: string
  uploaded_at: string
  file_data: string    // base64 of the PDF file
  file_size_kb: number
}

interface CataloguesStore {
  catalogues: CatalogueFile[]
  uploadCatalogue: (type: 'parfums' | 'flacons', file: File) => Promise<void>
  deleteCatalogue: (id: string) => void
  getCatalogue: (type: 'parfums' | 'flacons') => CatalogueFile | undefined
}

export const useCataloguesStore = create<CataloguesStore>()(
  persist(
    (set, get) => ({
      catalogues: [],

      uploadCatalogue: async (type, file) => {
        // 5MB Limit check
        const maxSize = 5 * 1024 * 1024
        if (file.size > maxSize) {
          throw new Error('Fichier trop volumineux. Maximum 5 MB.')
        }

        return new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => {
            const base64 = reader.result as string
            const newCatalogue: CatalogueFile = {
              id: crypto.randomUUID(),
              type,
              filename: file.name,
              uploaded_at: new Date().toISOString(),
              file_data: base64,
              file_size_kb: Math.round(file.size / 1024),
            }

            set((state) => ({
              catalogues: [
                ...state.catalogues.filter((c) => c.type !== type),
                newCatalogue,
              ],
            }))
            resolve()
          }
          reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier.'))
          reader.readAsDataURL(file)
        })
      },

      deleteCatalogue: (id) => {
        set((state) => ({
          catalogues: state.catalogues.filter((c) => c.id !== id),
        }))
      },

      getCatalogue: (type) => {
        return get().catalogues.find((c) => c.type === type)
      },
    }),
    {
      name: 'amouris_catalogues',
    }
  )
)
