'use server'

import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const fetchAllProducts = async (filters: any = {}) => {
  const supabase = await createClient();
  let query = supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      brand:brands(*),
      tags:product_tags(tag_id, tags(*)),
      variants:flacon_variants(*)
    `);

  if (filters.status === 'admin') {
    // Admin can see everything
  } else if (filters.status) {
    query = query.eq('status', filters.status);
  } else {
    query = query.eq('status', 'active');
  }

  if (filters.type) {
    query = query.eq('product_type', filters.type);
  }

  if (filters.category_id) {
    query = query.eq('category_id', filters.category_id);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const fetchProductBySlug = async (slug: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      brand:brands(*),
      tags:product_tags(tag_id, tags(*)),
      variants:flacon_variants(*)
    `)
    .eq('slug', slug)
    .single();

  if (error) return null;
  return data;
};

export const createProduct = async (data: any) => {
  const admin = createAdminClient();
  const { tag_ids, variants, ...productPayload } = data;

  // Insert the product core data
  const { data: product, error } = await admin
    .from('products')
    .insert(productPayload)
    .select()
    .single();

  if (error) {
    console.error('Error in createProduct:', error);
    throw error;
  }

  // Handle M2M relationships for tags
  if (tag_ids && tag_ids.length > 0) {
    const tagLinks = tag_ids.map((tagId: string) => ({
      product_id: product.id,
      tag_id: tagId
    }));
    await admin.from('product_tags').insert(tagLinks);
  }

  // Handle variants for flacons
  if (product.product_type === 'flacon' && variants) {
    const variantData = variants.map((v: any) => ({
      ...v,
      product_id: product.id
    }));
    await admin.from('flacon_variants').insert(variantData);
  }

  return product;
};

export const updateProduct = async (id: string, data: any) => {
  const admin = createAdminClient();
  const { tag_ids, variants, ...productPayload } = data;

  // Update the product core data
  const { error } = await admin
    .from('products')
    .update(productPayload)
    .eq('id', id);

  if (error) {
    console.error('Error in updateProduct:', error);
    throw error;
  }

  // Sync tags
  if (tag_ids !== undefined) {
    await admin.from('product_tags').delete().eq('product_id', id);
    if (tag_ids.length > 0) {
      const tagLinks = tag_ids.map((tagId: string) => ({
        product_id: id,
        tag_id: tagId
      }));
      await admin.from('product_tags').insert(tagLinks);
    }
  }

  // Sync variants
  if (variants !== undefined) {
    await admin.from('flacon_variants').delete().eq('product_id', id);
    if (variants.length > 0) {
      const variantData = variants.map((v: any) => ({
        ...v,
        product_id: id
      }));
      await admin.from('flacon_variants').insert(variantData);
    }
  }

  return true;
};

export const deleteProduct = async (id: string) => {
  const admin = createAdminClient();
  const { error } = await admin.from('products').delete().eq('id', id);
  if (error) throw error;
  return true;
};

export const updateStockGrams = async (id: string, delta: number) => {
  const admin = createAdminClient();
  try {
    const { error } = await admin.rpc('increment_product_stock', {
      p_id: id,
      delta: delta
    });
    if (error) throw error;
  } catch {
    const { data: p } = await admin.from('products').select('stock_grams').eq('id', id).single();
    if (p) {
      await admin.from('products').update({ stock_grams: Number(p.stock_grams) + delta }).eq('id', id);
    }
  }
};

export const updateVariantStock = async (variantId: string, delta: number) => {
  const admin = createAdminClient();
  const { data: v } = await admin.from('flacon_variants').select('stock_units').eq('id', variantId).single();
  if (v) {
    await admin.from('flacon_variants').update({ stock_units: Number(v.stock_units) + delta }).eq('id', variantId);
  }
};
