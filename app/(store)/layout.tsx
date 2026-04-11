import { Header } from '@/components/store/header';
import { Footer } from '@/components/store/footer';
import { AnnouncementBar } from '@/components/store/announcement-bar';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // Fetch announcements & settings
  const [ { data: announcements }, { data: settings } ] = await Promise.all([
    supabase.from('announcements').select('*').eq('is_active', true).order('display_order'),
    supabase.from('settings').select('*').limit(1).maybeSingle()
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <AnnouncementBar 
        initialAnnouncements={announcements || []} 
        settings={settings || undefined}
      />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
