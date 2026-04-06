'use server';

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function getActiveAnnouncements() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching announcements:', error);
    return [];
  }

  return (data || []).map((a: any) => ({
    id: a.id,
    textAR: a.text_ar,
    textFR: a.text_fr,
  }));
}

export async function upsertAnnouncement(announcementData: {
  id?: string;
  text_ar: string;
  text_fr: string;
  is_active?: boolean;
  display_order?: number;
}) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('announcements')
    .upsert([announcementData])
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath('/');
  revalidatePath('/admin/settings');
  return data;
}
