'use server';

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { Collection } from '@/lib/types';

export async function getCollections(): Promise<Collection[]> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .order('name_fr');

  if (error) {
    console.error('Error fetching collections:', error);
    return [];
  }

  return (data || []).map(c => ({
    id: c.id,
    nameAR: c.name_ar,
    nameFR: c.name_fr,
    coverImage: c.cover_image,
}

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function createCollectionAction(collection: any) {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('collections')
      .insert([{ 
        name_fr: collection.name_fr, 
        name_ar: collection.name_ar, 
        description_fr: collection.description_fr,
        description_ar: collection.description_ar,
        cover_image: collection.cover_image
      }])
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    revalidatePath('/admin/collections');
    revalidatePath('/shop');
    return { success: true, data };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function updateCollectionAction(id: string, collection: any) {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('collections')
      .update({ 
        name_fr: collection.name_fr, 
        name_ar: collection.name_ar, 
        description_fr: collection.description_fr,
        description_ar: collection.description_ar,
        cover_image: collection.cover_image
      })
      .eq('id', id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    revalidatePath('/admin/collections');
    revalidatePath('/shop');
    return { success: true, data };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function deleteCollectionAction(id: string) {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from('collections').delete().eq('id', id);

    if (error) return { success: false, error: error.message };
    revalidatePath('/admin/collections');
    revalidatePath('/shop');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
