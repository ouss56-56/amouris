import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import AdminInvoicesClient from './AdminInvoicesClient';
import { getCurrentUser } from '@/lib/actions/auth';
import { redirect } from 'next/navigation';

export default async function AdminInvoicesPage() {
  const data = await getCurrentUser();
  
  if (!data || !data.profile) {
    redirect('/login');
  }

  // Admin access check
  if (data.profile.role !== 'admin' && data.profile.role !== 'owner') {
    redirect('/account');
  }

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: invoices, error } = await supabase
    .from('invoices')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching invoices:', error);
  }

  return (
    <AdminInvoicesClient 
      initialInvoices={invoices || []} 
    />
  );
}
