import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import AnnouncementsClient from './AnnouncementsClient';

export default async function AnnouncementsPage() {
  const supabase = await createClient();

  const { data: announcements } = await supabase
    .from('announcements')
    .select('*')
    .order('display_order', { ascending: true });

  return (
    <AnnouncementsClient initialAnnouncements={announcements || []} />
  );
}
