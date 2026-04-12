'use server';

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { Category } from '@/lib/types';

export async function getCategories() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name_fr', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return (data || []).map((c: any) => ({
    id: c.id,
    nameAR: c.name_ar,
    nameFR: c.name_fr,
    slug: c.slug,
}

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function createCategoryAction(category: any) {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('categories')
      .insert([{ 
        name_fr: category.name_fr, 
        name_ar: category.name_ar, 
        slug: category.slug,
        description_fr: category.description_fr,
        description_ar: category.description_ar,
        image_url: category.image_url
      }])
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    revalidatePath('/admin/categories');
    revalidatePath('/shop');
    return { success: true, data };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function updateCategoryAction(id: string, category: any) {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('categories')
      .update({ 
        name_fr: category.name_fr, 
        name_ar: category.name_ar, 
        slug: category.slug,
        description_fr: category.description_fr,
        description_ar: category.description_ar,
        image_url: category.image_url
      })
      .eq('id', id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    revalidatePath('/admin/categories');
    revalidatePath('/shop');
    return { success: true, data };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function deleteCategoryAction(id: string) {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from('categories').delete().eq('id', id);

    if (error) return { success: false, error: error.message };
    revalidatePath('/admin/categories');
    revalidatePath('/shop');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
