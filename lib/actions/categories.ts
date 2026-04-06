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
  }));
}
