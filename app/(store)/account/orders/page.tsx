import { fetchCustomerOrders } from '@/lib/api/orders';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AccountOrdersListClient from './AccountOrdersListClient';

export default async function AccountOrdersPage() {
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

  const orders = await fetchCustomerOrders(profile.id);

  return <AccountOrdersListClient initialOrders={orders} />;
}
