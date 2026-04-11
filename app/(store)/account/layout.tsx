import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AccountSidebarClient from './AccountSidebarClient';

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-neutral-50/50 flex flex-col md:flex-row">
      <AccountSidebarClient customer={profile} />
      <main className="flex-1 w-full max-max-7xl mx-auto p-4 md:p-12 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
