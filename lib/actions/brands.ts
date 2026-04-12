'use server';

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { Brand } from '@/lib/types';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function getBrands() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching brands:', error);
    return [];
  }

  return (data || []).map((b: any) => ({
    id: b.id,
    nameAR: b.name_ar,
    nameFR: b.name,
    logo: b.logo_url,
  }));
}

export async function createBrand(brand: any) {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('brands')
      .insert([{ 
        name: brand.name || brand.nameFR, 
        name_ar: brand.name_ar || brand.nameAR, 
        logo_url: brand.logo_url || brand.logo,
        description_fr: brand.description_fr,
        description_ar: brand.description_ar
      }])
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    revalidatePath('/admin/brands');
    revalidatePath('/shop');
    revalidatePath('/');
    return { success: true, data };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function updateBrand(id: string, brand: any) {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('brands')
      .update({ 
        name: brand.name || brand.nameFR, 
        name_ar: brand.name_ar || brand.nameAR, 
        logo_url: brand.logo_url || brand.logo,
        description_fr: brand.description_fr,
        description_ar: brand.description_ar
      })
      .eq('id', id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    revalidatePath('/admin/brands');
    revalidatePath('/shop');
    revalidatePath('/');
    return { success: true, data };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function deleteBrand(id: string) {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from('brands').delete().eq('id', id);

    if (error) return { success: false, error: error.message };
    revalidatePath('/admin/brands');
    revalidatePath('/shop');
    revalidatePath('/');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
