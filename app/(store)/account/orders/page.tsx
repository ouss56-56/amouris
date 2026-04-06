import { getCurrentUser } from '@/lib/actions/auth';
import { getOrdersByCustomer } from '@/lib/actions/orders';
import { redirect } from 'next/navigation';
import AccountOrdersClient from './AccountOrdersClient';

export default async function AccountOrdersPage() {
  const data = await getCurrentUser();
  
  if (!data || !data.profile) {
    redirect('/login');
  }

  const orders = await getOrdersByCustomer(data.profile.id);

  return <AccountOrdersClient orders={orders} />;
}
