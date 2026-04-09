'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { fetchAllProducts, createProduct, updateProduct, deleteProduct, updateStockGrams as apiUpdateStockGrams, updateVariantStock as apiUpdateVariantStock } from '@/lib/api/products'

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
  lastUpdated: number | null
  fetchProducts: (force?: boolean) => Promise<void>
  addProduct: (p: any) => Promise<Product>
  updateProduct: (id: string, updates: any) => Promise<void>
  deleteProduct: (id: string) => Promise<void>
  updateStockGrams: (id: string, delta: number) => Promise<void>
  updateVariantStock: (productId: string, variantId: string, delta: number) => Promise<void>
  seed: (products: Product[]) => void
  getBySlug: (slug: string) => Product | undefined
  getActiveByType: (type: 'perfume' | 'flacon') => Product[]
  getActiveByTag: (tagId: string) => Product[]
}

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

const mapProductFromDb = (p: any): Product => {
  // Ensure tag_ids is always extracted correctly from the joined 'tags' array
  const tag_ids = Array.isArray(p.tags) 
    ? p.tags.map((t: any) => t.tag_id || t.id).filter(Boolean)
    : [];

  return {
    ...p,
    tag_ids: tag_ids.length > 0 ? tag_ids : (p.tag_ids || [])
  };
};

export const useProductsStore = create<ProductsStore>()(
  persist(
    (set, get) => ({
      products: [],
      isLoading: false,
      error: null,
      lastUpdated: null,

      fetchProducts: async (force = false) => {
        const { lastUpdated, products } = get()
        const now = Date.now()

        if (!force && lastUpdated && now - lastUpdated < CACHE_DURATION && products.length > 0) {
          return
        }

        set({ isLoading: true, error: null })
        try {
          const fetchedProducts = await fetchAllProducts({ status: 'admin' })
          const mapped = fetchedProducts.map(mapProductFromDb)
          set({ products: mapped, lastUpdated: now, isLoading: false })
        } catch (err: any) {
          set({ error: err.message, isLoading: false })
        }
      },

      addProduct: async (data: any) => {
        set({ isLoading: true, error: null })
        try {
          const newProduct = await createProduct(data)
          const product = mapProductFromDb(newProduct)
          set((s) => ({ 
            products: [product, ...s.products],
            isLoading: false 
          }))
          return product
        } catch (err: any) {
          set({ error: err.message, isLoading: false })
          throw err
        }
      },

      updateProduct: async (id, updates: any) => {
        set({ isLoading: true, error: null })
        try {
          await updateProduct(id, updates)
          set((s) => ({
            products: s.products.map((p) => {
              if (p.id === id) {
                const updatedProduct = { ...p, ...updates };
                // If tags were updated, we need to ensure tag_ids is updated in the store too
                if (updates.tags) {
                  updatedProduct.tag_ids = updates.tags;
                }
                return updatedProduct;
              }
              return p;
            }),
            isLoading: false
          }))
        } catch (err: any) {
          set({ error: err.message, isLoading: false })
          throw err
        }
      },

      deleteProduct: async (id) => {
        set({ isLoading: true, error: null })
        try {
          await deleteProduct(id)
          set((s) => ({
            products: s.products.filter((p) => p.id !== id),
            isLoading: false
          }))
        } catch (err: any) {
          set({ error: err.message, isLoading: false })
          throw err
        }
      },

      updateStockGrams: async (id, delta) => {
        try {
          await apiUpdateStockGrams(id, delta)
          set((s) => ({
            products: s.products.map((p) =>
              p.id === id ? { ...p, stock_grams: Math.max(0, (p.stock_grams || 0) + delta) } : p
            ),
          }))
        } catch (err: any) {
          console.error('Failed to update stock:', err)
        }
      },

      updateVariantStock: async (productId, variantId, delta) => {
        try {
          await apiUpdateVariantStock(variantId, delta)
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
        } catch (err: any) {
          console.error('Failed to update variant stock:', err)
        }
      },

      seed: (products) => set({ products, lastUpdated: Date.now() }),
      getBySlug: (slug) => get().products.find((p) => p.slug === slug),
      getActiveByType: (type) => get().products.filter((p) => p.product_type === type && p.status === 'active'),
      getActiveByTag: (tagId) => get().products.filter((p) => p.status === 'active' && p.tag_ids?.includes(tagId)),
    }),
    {
      name: 'amouris_products_cache',
    }
  )
)
