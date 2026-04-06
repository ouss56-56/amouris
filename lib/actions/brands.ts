'use server';

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { Brand } from '@/lib/types';

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
