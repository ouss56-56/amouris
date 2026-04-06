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
  }));
}
