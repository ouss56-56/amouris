'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function createAnnouncementAction(announcement: {
  text_ar: string;
  text_fr: string;
  is_active: boolean;
  display_order: number;
}) {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('announcements')
      .insert([announcement])
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/');
    revalidatePath('/admin/settings');
    revalidatePath('/admin/announcements');
    return { success: true, data };
  } catch (error: any) {
    console.error('Error creating announcement:', error);
    return { success: false, error: error.message };
  }
}

export async function updateAnnouncementAction(id: string, updates: any) {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('announcements')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/');
    revalidatePath('/admin/settings');
    revalidatePath('/admin/announcements');
    return { success: true, data };
  } catch (error: any) {
    console.error('Error updating announcement:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteAnnouncementAction(id: string) {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/');
    revalidatePath('/admin/settings');
    revalidatePath('/admin/announcements');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting announcement:', error);
    return { success: false, error: error.message };
  }
}

export async function toggleAnnouncementActive(id: string, currentStatus: boolean) {
  return updateAnnouncementAction(id, { is_active: !currentStatus });
}
