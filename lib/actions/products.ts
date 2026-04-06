import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { Product, ProductType } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { mapDbProductToFrontend } from '@/lib/supabase/utils';

export async function getProducts(filters?: {
  type?: ProductType;
  category?: string;
  brand?: string;
  collection?: string;
  tag?: string;
  search?: string;
  status?: 'active' | 'draft';
}) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  let query = supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      brand:brands(*),
      collection:collections(*),
      variants:flacon_variants(*),
      tags:product_tags(tag:tags(*))
    `);

  if (filters?.type) {
    query = query.eq('product_type', filters.type);
  }

  if (filters?.category) {
    query = query.eq('category_id', filters.category);
  }

  if (filters?.brand) {
    query = query.eq('brand_id', filters.brand);
  }

  if (filters?.collection) {
    query = query.eq('collection_id', filters.collection);
  }

  if (filters?.status) {
    query = query.eq('status', filters.status);
  } else {
    query = query.eq('status', 'active');
  }

  if (filters?.search) {
    query = query.or(`name_fr.ilike.%${filters.search}%,name_ar.ilike.%${filters.search}%`);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  // Map to frontend types
  return (data || []).map(mapDbProductToFrontend);
}

export async function getProductBySlug(slug: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      brand:brands(*),
      collection:collections(*),
      variants:flacon_variants(*),
      tags:product_tags(tag:tags(*))
    `)
    .eq('slug', slug)
    .single();

  if (error || !data) {
    console.error('Error fetching product by slug:', error);
    return null;
  }

  return mapDbProductToFrontend(data);
}

export async function getProductById(id: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      brand:brands(*),
      collection:collections(*),
      variants:flacon_variants(*),
      tags:product_tags(tag:tags(*))
    `)
    .eq('id', id)
    .single();

  if (error || !data) {
    console.error('Error fetching product by id:', error);
    return null;
  }

  return mapDbProductToFrontend(data);
}

import { createAdminClient } from '@/lib/supabase/admin';

export async function createProduct(product: Partial<Product>) {
  const supabase = createAdminClient();

  // 1. Insert base product
  const { data: newProd, error: prodError } = await supabase
    .from('products')
    .insert([{
      name_ar: product.nameAR,
      name_fr: product.nameFR,
      description_ar: product.descriptionAR,
      description_fr: product.descriptionFR,
      product_type: product.type,
      category_id: product.categoryId,
      brand_id: product.brandId,
      collection_id: product.collectionId,
      images: product.images,
      status: product.status || 'active',
      price_per_gram: product.type === 'perfume' ? (product as any).pricePerGram : null,
      stock_grams: product.type === 'perfume' ? (product as any).stockInGrams : null,
      slug: (product.nameFR || '').toLowerCase().replace(/ /g, '-'),
    }])
    .select()
    .single();

  if (prodError) throw new Error(prodError.message);

  // 2. Insert variants if flacon
  if (product.type === 'flacon' && (product as any).variants) {
    const variants = (product as any).variants.map((v: any) => ({
      product_id: newProd.id,
      size_ml: parseInt(v.size.replace('ml', '')),
      color: v.color,
      shape: v.shape,
      price: v.price,
      stock_units: v.stock,
    }));
    const { error: varError } = await supabase.from('flacon_variants').insert(variants);
    if (varError) console.error('Error inserting variants:', varError);
  }

  // 3. Insert tags
  if (product.tagIds && product.tagIds.length > 0) {
    const tags = product.tagIds.map(tagId => ({
      product_id: newProd.id,
      tag_id: tagId
    }));
    await supabase.from('product_tags').insert(tags);
  }

  revalidatePath('/admin/products');
  revalidatePath('/');
  return newProd;
}

export async function updateProduct(id: string, product: Partial<Product>) {
  const supabase = createAdminClient();

  // 1. Update base product
  const { data: updatedProd, error: prodError } = await supabase
    .from('products')
    .update({
      name_ar: product.nameAR,
      name_fr: product.nameFR,
      description_ar: product.descriptionAR,
      description_fr: product.descriptionFR,
      category_id: product.categoryId,
      brand_id: product.brandId,
      collection_id: product.collectionId,
      images: product.images,
      status: product.status,
      price_per_gram: product.type === 'perfume' ? (product as any).pricePerGram : null,
      stock_grams: product.type === 'perfume' ? (product as any).stockInGrams : null,
    })
    .eq('id', id)
    .select()
    .single();

  if (prodError) throw new Error(prodError.message);

  // 2. Update variants (Simple way: delete and re-insert)
  if (product.type === 'flacon' && (product as any).variants) {
    await supabase.from('flacon_variants').delete().eq('product_id', id);
    const variants = (product as any).variants.map((v: any) => ({
      product_id: id,
      size_ml: parseInt(v.size.replace('ml', '')),
      color: v.color,
      shape: v.shape,
      price: v.price,
      stock_units: v.stock,
    }));
    await supabase.from('flacon_variants').insert(variants);
  }

  // 3. Update tags
  if (product.tagIds) {
    await supabase.from('product_tags').delete().eq('product_id', id);
    if (product.tagIds.length > 0) {
      const tags = product.tagIds.map(tagId => ({
        product_id: id,
        tag_id: tagId
      }));
      await supabase.from('product_tags').insert(tags);
    }
  }

  revalidatePath('/admin/products');
  revalidatePath(`/product/${updatedProd.slug}`);
  revalidatePath('/');
  return updatedProd;
}

export async function deleteProduct(id: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin/products');
  revalidatePath('/');
}

