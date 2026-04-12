import { createClient } from '@/lib/supabase/client';


export const fetchAllProducts = async (options?: { status?: string }) => {
  const supabase = createClient();
  const isAdmin = options?.status === 'admin';
  
  // Base selection for storefront
  let selectQuery = `
    id, name_fr, name_ar, slug, product_type,
    price_per_gram, base_price, images, status,
    category:categories(id, name_fr, name_ar, slug),
    brand:brands(id, name, name_ar, logo_url),
    collection:collections(id, name_fr, name_ar),
    variants:flacon_variants(id, size_ml, color, color_name, shape, price),
    tags:product_tags(tag:tags(*))
  `;

  // Add stock fields for admin or for stock-check logic
  if (isAdmin) {
    selectQuery = `
      *,
      category:categories(*),
      brand:brands(*),
      collection:collections(*),
      variants:flacon_variants(*),
      tags:product_tags(tag:tags(*))
    `;
  } else {
    // We still need to know IF it's in stock for the storefront, 
    // but the user wants to "ne pas exposer le stock".
    // I'll select the stock fields but then convert them to booleans before returning.
    selectQuery += `, stock_grams, variants:flacon_variants(id, size_ml, color, color_name, shape, price, stock_units)`;
  }
  
  let query = supabase.from('products').select(selectQuery).order('created_at', { ascending: false });

  if (options?.status && options.status !== 'admin') {
    query = query.eq('status', options.status);
  }

  const { data, error } = await query;
  if (error) throw error;

  return data.map(p => {
    const processed = {
      ...p,
      tag_ids: p.tags?.map((t: any) => t.tag?.id).filter(Boolean) || []
    };

    if (!isAdmin) {
      // Convert quantitative stock to booleans for storefront
      processed.in_stock = (p.stock_grams || 0) > 0;
      
      if (p.variants) {
        processed.variants = p.variants.map((v: any) => ({
          ...v,
          is_available: (v.stock_units || 0) > 0
        }));
        
        // Remove exact unit counts
        processed.variants.forEach((v: any) => {
          delete v.stock_units;
        });
      }
      
      // Remove exact gram counts
      delete processed.stock_grams;
    }

    return processed;
  });
};

export const fetchProductById = async (id: string, options?: { isAdmin?: boolean }) => {
  const supabase = createClient();
  const isAdmin = options?.isAdmin || false;

  let selectQuery = `
    *,
    category:categories(*),
    brand:brands(*),
    collection:collections(*),
    variants:flacon_variants(*),
    tags:product_tags(tag:tags(*))
  `;

  const { data, error } = await supabase
    .from('products')
    .select(selectQuery)
    .eq('id', id)
    .single();

  if (error) throw error;
  
  const processed = {
    ...data,
    tag_ids: data.tags?.map((t: any) => t.tag?.id).filter(Boolean) || []
  };

  if (!isAdmin) {
    processed.in_stock = (data.stock_grams || 0) > 0;
    if (data.variants) {
      processed.variants = data.variants.map((v: any) => ({
        ...v,
        is_available: (v.stock_units || 0) > 0
      }));
      processed.variants.forEach((v: any) => delete v.stock_units);
    }
    delete processed.stock_grams;
  }
  
  return processed;
};

export const createProduct = async (productData: any) => {
  const supabase = createClient();
  
  const { tag_ids, variants, ...baseProduct } = productData;

  // Cleanup null values
  if (baseProduct.brand_id === '') baseProduct.brand_id = null;
  if (baseProduct.collection_id === '') baseProduct.collection_id = null;
  if (baseProduct.category_id === '') baseProduct.category_id = null;

  // 1. Insert base product
  const { data: newProduct, error } = await supabase
    .from('products')
    .insert([baseProduct])
    .select()
    .single();

  if (error) throw error;

  // 2. Insert tags
  if (tag_ids && tag_ids.length > 0) {
    const tagsToInsert = tag_ids.map((tagId: string) => ({
      product_id: newProduct.id,
      tag_id: tagId,
    }));
    await supabase.from('product_tags').insert(tagsToInsert);
  }

  // 3. Insert variants if applicable
  if (baseProduct.product_type !== 'perfume' && variants && variants.length > 0) {
    const variantsToInsert = variants.map((v: any) => {
      const { id, isNew, ...variantData } = v;
      return {
        ...variantData,
        product_id: newProduct.id,
        // If it's a temp ID like 'new_' or 'v_', let Supabase generate one or transform it
        id: (id && !id.startsWith('new_') && !id.startsWith('v_')) ? id : `var-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
      };
    });
    await supabase.from('flacon_variants').insert(variantsToInsert);
  }

  return fetchProductById(newProduct.id, { isAdmin: true });
};

export const updateProduct = async (id: string, updates: any) => {
  const supabase = createClient();
  const { tag_ids, variants, ...baseData } = updates;

  if (baseData.brand_id === '') baseData.brand_id = null;
  if (baseData.collection_id === '') baseData.collection_id = null;
  if (baseData.category_id === '') baseData.category_id = null;

  // 1. Update base product
  if (Object.keys(baseData).length > 0) {
    const { error: updateError } = await supabase
      .from('products')
      .update(baseData)
      .eq('id', id);

    if (updateError) throw updateError;
  }

  // 2. Sync Tags
  if (tag_ids !== undefined) {
    await supabase.from('product_tags').delete().eq('product_id', id);
    if (tag_ids && tag_ids.length > 0) {
      const newTags = tag_ids.map((tagId: string) => ({
        product_id: id,
        tag_id: tagId,
      }));
      const { error: tagError } = await supabase.from('product_tags').insert(newTags);
      if (tagError) throw tagError;
    }
  }

  // 3. Sync Variants
  if (variants !== undefined) {
    const currentProduct = await fetchProductById(id, { isAdmin: true });
    const existingVariantIds = currentProduct.variants?.map((v: any) => v.id) || [];
    const incomingVariantIds = variants.filter((v: any) => v.id && !v.id.startsWith('new_') && !v.id.startsWith('v_')).map((v: any) => v.id);

    // Deletions
    const toDelete = existingVariantIds.filter(vId => !incomingVariantIds.includes(vId));
    if (toDelete.length > 0) {
      await supabase.from('flacon_variants').delete().in('id', toDelete);
    }

    // Upsertions
    for (const v of variants) {
      const { isNew, ...vData } = v;
      if (!v.id || v.id.startsWith('new_') || v.id.startsWith('v_')) {
        // Insertion
        const { id: _, ...insertData } = vData;
        await supabase.from('flacon_variants').insert({
          ...insertData,
          product_id: id,
          id: `var-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
        });
      } else {
        // Update
        await supabase.from('flacon_variants').update(vData).eq('id', v.id);
      }
    }
  }

  return true;
};

export const deleteProduct = async (id: string) => {
  const supabase = createClient();
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
  return true;
};

export const updateStockGrams = async (id: string, delta: number) => {
  const supabase = createClient();
  // Fetch current
  const { data: current, error: fetchErr } = await supabase
    .from('products')
    .select('stock_grams')
    .eq('id', id)
    .single();

  if (fetchErr || !current) throw fetchErr || new Error('Product not found');

  const newStock = Math.max(0, Number(current.stock_grams) + delta);

  const { error } = await supabase
    .from('products')
    .update({ stock_grams: newStock })
    .eq('id', id);

  if (error) throw error;
  return newStock;
};

export const updateVariantStock = async (variantId: string, delta: number) => {
  const supabase = createClient();
  const { data: current, error: fetchErr } = await supabase
    .from('flacon_variants')
    .select('stock_units')
    .eq('id', variantId)
    .single();

  if (fetchErr || !current) throw fetchErr || new Error('Variant not found');

  const newStock = Math.max(0, Number(current.stock_units) + delta);

  const { error } = await supabase
    .from('flacon_variants')
    .update({ stock_units: newStock })
    .eq('id', variantId);

  if (error) throw error;
  return newStock;
};

export const setProductStockGrams = async (id: string, amount: number) => {
  const supabase = createClient();
  const { error } = await supabase
    .from('products')
    .update({ stock_grams: Math.max(0, amount) })
    .eq('id', id);

  if (error) throw error;
  return true;
};

export const setVariantStockUnits = async (variantId: string, amount: number) => {
  const supabase = createClient();
  const { error } = await supabase
    .from('flacon_variants')
    .update({ stock_units: Math.max(0, amount) })
    .eq('id', variantId);

  if (error) throw error;
  return true;
};

export const fetchWishlistProducts = async (ids: string[]) => {
  const supabase = createClient();
  
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
    .in('id', ids);

  if (error) throw error;
  
  return data.map(p => ({
    ...p,
    tag_ids: p.tags?.map((t: any) => t.tag?.id).filter(Boolean) || [],
    in_stock: (p.stock_grams || 0) > 0 || p.variants?.some((v: any) => (v.stock_units || 0) > 0)
  }));
};

// Alias used by ProductModal
export const addProduct = createProduct;
