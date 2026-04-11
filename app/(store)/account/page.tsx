import { fetchCustomerOrders } from '@/lib/api/orders';
import { createClient } from '@/lib/supabase/server';
import AccountOverviewClient from './AccountOverviewClient';
import { redirect } from 'next/navigation';

export default async function AccountPage() {
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

  const orders = await fetchCustomerOrders(profile.id, supabase);

  return (
    <AccountOverviewClient 
      customer={profile} 
      orders={orders} 
    />
  );
}
