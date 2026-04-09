'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createClient } from '@/lib/supabase/client'


export interface FlaconVariant {
  id: string
  product_id?: string
  size_ml: number
  color: string
  color_name: string
  shape: string
  price: number
  stock_units: number
}

export interface Product {
  id: string
  product_type: 'perfume' | 'flacon'
  name_fr: string
  name_ar: string
  slug: string
  description_fr: string
  description_ar: string
  category_id: string
  brand_id: string | null
  collection_id: string | null
  tag_ids: string[]
  price_per_gram?: number
  stock_grams?: number
  base_price?: number
  variants?: FlaconVariant[]
  images: string[]
  status: 'active' | 'draft'
  created_at: string
}

interface ProductsStore {
  products: Product[]
  isLoading: boolean
  error: string | null
  fetchProducts: () => Promise<void>
  addProduct: (p: any) => Promise<Product>
  updateProduct: (id: string, updates: any) => Promise<void>
  deleteProduct: (id: string) => Promise<void>
  updateStockGrams: (id: string, delta: number) => Promise<void>
  updateVariantStock: (productId: string, variantId: string, delta: number) => Promise<void>
  seed: (products: Product[]) => void
  getBySlug: (slug: string) => Product | undefined
  getActiveByType: (type: 'perfume' | 'flacon') => Product[]
}

export const useProductsStore = create<ProductsStore>()(
  persist(
    (set, get) => ({
      products: [],
      isLoading: false,
      error: null,

      fetchProducts: async () => {
        // In client-only mode, we don't fetch from Supabase.
        // If the store is empty, we might want to seed it or just leave it.
      },

      addProduct: async (data) => {
        const newProduct: Product = {
          ...data,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          tag_ids: data.tag_ids || [],
          variants: (data.variants || []).map((v: any) => ({
            ...v,
            id: crypto.randomUUID(),
          })),
        }
        set((s) => ({ products: [newProduct, ...s.products] }))
        return newProduct
      },

      updateProduct: async (id, updates) => {
        set((s) => ({
          products: s.products.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        }))
      },

      deleteProduct: async (id) => {
        set((s) => ({
          products: s.products.filter((p) => p.id !== id),
        }))
      },

      updateStockGrams: async (id, delta) => {
        set((s) => ({
          products: s.products.map((p) =>
            p.id === id ? { ...p, stock_grams: Math.max(0, (p.stock_grams || 0) + delta) } : p
          ),
        }))
      },

      updateVariantStock: async (productId, variantId, delta) => {
        set((s) => ({
          products: s.products.map((p) =>
            p.id === productId
              ? {
                  ...p,
                  variants: p.variants?.map((v) =>
                    v.id === variantId ? { ...v, stock_units: Math.max(0, v.stock_units + delta) } : v
                  ),
                }
              : p
          ),
        }))
      },

      seed: (products) => set({ products }),
      getBySlug: (slug) => get().products.find((p) => p.slug === slug),
      getActiveByType: (type) => get().products.filter((p) => p.product_type === type && p.status === 'active'),
    }),
    {
      name: 'amouris_products',
    }
  )
)
