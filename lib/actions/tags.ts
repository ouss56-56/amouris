'use server';

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { Tag, Product, ProductType } from '@/lib/types';
import { mapDbProductToFrontend } from '@/lib/supabase/utils';

export async function getHomepageTags() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // 1. Get tags with show_on_homepage = true
  const { data: tags, error: tagsError } = await supabase
    .from('tags')
    .select('*')
    .eq('show_on_homepage', true)
    .order('homepage_order', { ascending: true });

  if (tagsError) {
    console.error('Error fetching homepage tags:', tagsError);
    return [];
  }

  // 2. Map to frontend types
  return (tags || []).map((t: { id: string; name_ar: string; name_fr: string; slug: string; show_on_homepage: boolean; homepage_order: number }) => ({
    id: t.id,
    nameAR: t.name_ar,
    nameFR: t.name_fr,
    slug: t.slug,
    showOnHomepage: t.show_on_homepage,
    homepageOrder: t.homepage_order,
  }));
}

export async function getTags(): Promise<Tag[]> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .order('name_fr');

  if (error) {
    console.error('Error fetching tags:', error);
    return [];
  }

  return (data || []).map(t => ({
    id: t.id,
    nameAR: t.name_ar,
    nameFR: t.name_fr,
    slug: t.slug,
  }));
}

export async function getProductsByTag(tagId: string, limit = 8) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('product_tags')
    .select(`
      product:products(
        *,
        category:categories(*),
        brand:brands(*),
        collection:collections(*),
        variants:flacon_variants(*),
        tags:product_tags(tag:tags(*))
      )
    `)
    .eq('tag_id', tagId)
    .limit(limit);

  if (error) {
    console.error('Error fetching products by tag:', error);
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data || []).map((item: { product: any }) => mapDbProductToFrontend(item.product));
}

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function createTagAction(tag: any) {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('tags')
      .insert([{ 
        name_fr: tag.name_fr, 
        name_ar: tag.name_ar, 
        slug: tag.slug,
        show_on_homepage: tag.show_on_homepage,
        homepage_order: tag.homepage_order
      }])
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    revalidatePath('/admin/tags');
    revalidatePath('/shop');
    return { success: true, data };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function updateTagAction(id: string, tag: any) {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('tags')
      .update({ 
        name_fr: tag.name_fr, 
        name_ar: tag.name_ar, 
        slug: tag.slug,
        show_on_homepage: tag.show_on_homepage,
        homepage_order: tag.homepage_order
      })
      .eq('id', id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    revalidatePath('/admin/tags');
    revalidatePath('/shop');
    return { success: true, data };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function deleteTagAction(id: string) {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from('tags').delete().eq('id', id);

    if (error) return { success: false, error: error.message };
    revalidatePath('/admin/tags');
    revalidatePath('/shop');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
