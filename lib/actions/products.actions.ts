'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function createProductAction(formData: any) {
  try {
    const supabase = createAdminClient()

    // Générer le slug depuis le nom FR
    const slug = formData.name_fr
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim() + '-' + Date.now()

    // Insérer le produit
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        product_type: formData.product_type,
        name_fr: formData.name_fr,
        name_ar: formData.name_ar,
        slug,
        description_fr: formData.description_fr,
        description_ar: formData.description_ar,
        category_id: formData.category_id || null,
        brand_id: formData.brand_id || null,
        collection_id: formData.collection_id || null,
        price_per_gram: formData.price_per_gram ?? null,
        stock_grams: formData.stock_grams ?? null,
        base_price: formData.base_price ?? null,
        status: formData.status,
        images: formData.images || []
      })
      .select()
      .single()

    if (productError) {
      console.error('INSERT ERROR:', JSON.stringify(productError, null, 2))
      return { success: false, error: productError.message }
    }

    // Insérer les tags
    if (formData.tag_ids && formData.tag_ids.length > 0) {
      await supabase.from('product_tags').insert(
        formData.tag_ids.map((tagId: string) => ({
          product_id: product.id,
          tag_id: tagId,
        }))
      )
    }

    // Insérer les variantes (flacons et accessoires)
    if (formData.variants && formData.variants.length > 0) {
      await supabase.from('flacon_variants').insert(
        formData.variants.map((v: any) => {
          const { id, isNew, ...variantData } = v;
          return {
            ...variantData,
            product_id: product.id,
            id: (id && !id.startsWith('new_') && !id.startsWith('v_')) ? id : `var-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
          };
        })
      )
    }

    revalidatePath('/shop')
    revalidatePath('/shop/parfums')
    revalidatePath('/shop/flacons')
    revalidatePath('/shop/accessoires')
    revalidatePath('/')
    revalidatePath('/admin/products')

    return { success: true, product }
  } catch (e: any) {
    console.error('ACTION ERROR:', e.message)
    return { success: false, error: e.message }
  }
}

export async function updateProductAction(id: string, formData: any) {
  try {
    const supabase = createAdminClient()

    const updatePayload: any = {
      name_fr: formData.name_fr,
      name_ar: formData.name_ar,
      description_fr: formData.description_fr,
      description_ar: formData.description_ar,
      category_id: formData.category_id || null,
      brand_id: formData.brand_id || null,
      collection_id: formData.collection_id || null,
      price_per_gram: formData.price_per_gram ?? null,
      stock_grams: formData.stock_grams ?? null,
      base_price: formData.base_price ?? null,
      status: formData.status,
    }

    if (formData.images !== undefined) {
      updatePayload.images = formData.images
    }

    const { data: result, error } = await supabase
      .from('products')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('UPDATE ERROR:', JSON.stringify(error, null, 2))
      return { success: false, error: error.message }
    }

    // Synchroniser tags
    if (formData.tag_ids !== undefined) {
      await supabase.from('product_tags').delete().eq('product_id', id)
      if (formData.tag_ids.length > 0) {
        await supabase.from('product_tags').insert(
          formData.tag_ids.map((tagId: string) => ({ product_id: id, tag_id: tagId }))
        )
      }
    }

    // Synchroniser variantes
    if (formData.variants !== undefined) {
      // First get existing variant ids for this product to compare
      const { data: currentVariants } = await supabase.from('flacon_variants').select('id').eq('product_id', id)
      const existingIds = currentVariants?.map((v: any) => v.id) || [];
      const incomingIds = formData.variants.filter((v: any) => v.id && !v.id.startsWith('new_') && !v.id.startsWith('v_')).map((v: any) => v.id);

      // Deletions
      const toDelete = existingIds.filter(vId => !incomingIds.includes(vId));
      if (toDelete.length > 0) {
        await supabase.from('flacon_variants').delete().in('id', toDelete);
      }

      // Upsertions
      for (const v of formData.variants) {
        const { isNew, ...vData } = v;
        if (!v.id || v.id.startsWith('new_') || v.id.startsWith('v_')) {
          const { id: _, ...insertData } = vData;
          await supabase.from('flacon_variants').insert({
            ...insertData,
            product_id: id,
            id: `var-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
          });
        } else {
          await supabase.from('flacon_variants').update(vData).eq('id', v.id);
        }
      }
    }

    revalidatePath('/admin/products')
    revalidatePath('/')
    revalidatePath('/shop')

    return { success: true, data: result }
  } catch (e: any) {
    console.error('ACTION ERROR:', e.message)
    return { success: false, error: e.message }
  }
}

export async function deleteProductAction(id: string) {
  try {
    const supabase = createAdminClient()
    const { error } = await supabase.from('products').delete().eq('id', id)
    
    if (error) {
      console.error('DELETE ERROR:', JSON.stringify(error, null, 2))
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/products')
    revalidatePath('/')
    revalidatePath('/shop')

    return { success: true }
  } catch (e: any) {
    console.error('ACTION ERROR:', e.message)
    return { success: false, error: e.message }
  }
}
