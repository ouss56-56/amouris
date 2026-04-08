'use client'
import { create } from 'zustand'
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
}

const supabase = createClient()

export const useProductsStore = create<ProductsStore>((set, get) => ({
  products: [],
  isLoading: false,
  error: null,

  fetchProducts: async () => {
    set({ isLoading: true })
    const { data, error } = await supabase
      .from('products')
      .select('*, flacon_variants(*), product_tags(tag_id)')
      .order('created_at', { ascending: false })
    
    if (error) {
      set({ error: error.message, isLoading: false })
    } else {
      const mapped = data.map((p: any) => ({
        ...p,
        tag_ids: p.product_tags?.map((t: any) => t.tag_id) || [],
        variants: p.flacon_variants || []
      }))
      set({ products: mapped, isLoading: false })
    }
  },

  addProduct: async (data) => {
    set({ isLoading: true })
    const { tag_ids, variants, ...rest } = data
    
    // 1. Insert product
    const { data: product, error } = await supabase
      .from('products')
      .insert([rest])
      .select()
      .single()
    
    if (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }

    // 2. Insert tags
    if (tag_ids?.length) {
      const tagInserts = tag_ids.map((tid: string) => ({ product_id: product.id, tag_id: tid }))
      await supabase.from('product_tags').insert(tagInserts)
    }

    // 3. Insert variants
    if (variants?.length) {
      const variantInserts = variants.map((v: any) => ({ ...v, product_id: product.id }))
      await supabase.from('flacon_variants').insert(variantInserts)
    }

    const { data: fullProduct } = await supabase
      .from('products')
      .select('*, flacon_variants(*), product_tags(tag_id)')
      .eq('id', product.id)
      .single()

    const mapped = {
      ...fullProduct,
      tag_ids: fullProduct.product_tags?.map((t: any) => t.tag_id) || [],
      variants: fullProduct.flacon_variants || []
    }

    set(s => ({ products: [mapped, ...s.products], isLoading: false }))
    return mapped
  },

  updateProduct: async (id, updates) => {
    set({ isLoading: true })
    const { tag_ids, variants, ...rest } = updates

    // 1. Update basic info
    const { error } = await supabase
      .from('products')
      .update(rest)
      .eq('id', id)
    
    if (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }

    // 2. Update tags (simplistic: delete and re-insert)
    if (tag_ids !== undefined) {
      await supabase.from('product_tags').delete().eq('product_id', id)
      if (tag_ids.length) {
        const tagInserts = tag_ids.map((tid: string) => ({ product_id: id, tag_id: tid }))
        await supabase.from('product_tags').insert(tagInserts)
      }
    }

    // 3. Update variants (simplistic: delete and re-insert)
    if (variants !== undefined) {
      await supabase.from('flacon_variants').delete().eq('product_id', id)
      if (variants.length) {
        const variantInserts = variants.map((v: any) => {
          const { id: _, ...vData} = v
          return { ...vData, product_id: id }
        })
        await supabase.from('flacon_variants').insert(variantInserts)
      }
    }

    await get().fetchProducts()
    set({ isLoading: false })
  },

  deleteProduct: async (id) => {
    set({ isLoading: true })
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
    set(s => ({ products: s.products.filter(p => p.id !== id), isLoading: false }))
  },

  updateStockGrams: async (id, delta) => {
    const p = get().products.find(x => x.id === id)
    if (!p) return
    const newVal = Math.max(0, (p.stock_grams || 0) + delta)
    await get().updateProduct(id, { stock_grams: newVal })
  },

  updateVariantStock: async (productId, variantId, delta) => {
    const p = get().products.find(x => x.id === productId)
    if (!p) return
    const v = p.variants?.find(x => x.id === variantId)
    if (!v) return
    const newVal = Math.max(0, v.stock_units + delta)
    
    // We update the specific variant in the DB
    await supabase.from('flacon_variants').update({ stock_units: newVal }).eq('id', variantId)
    await get().fetchProducts()
  }
}))
