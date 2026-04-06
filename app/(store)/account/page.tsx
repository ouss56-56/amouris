import { getCurrentUser } from '@/lib/actions/auth';
import { getOrdersByCustomer } from '@/lib/actions/orders';
import AccountOverviewClient from './AccountOverviewClient';
import { redirect } from 'next/navigation';
import { Customer } from '@/lib/types';

export default async function AccountOverviewPage() {
  const data = await getCurrentUser();
  
  if (!data || !data.profile) {
    redirect('/login');
  }

  const user: Customer = {
    id: data.profile.id,
    firstName: data.profile.first_name,
    lastName: data.profile.last_name,
    shopName: data.profile.shop_name,
    phoneNumber: data.profile.phone,
    wilaya: data.profile.wilaya,
    commune: data.profile.commune,
    status: data.profile.is_frozen ? 'frozen' : 'active',
    joinedAt: data.profile.created_at,
  };

  const orders = await getOrdersByCustomer(user.id);

  return <AccountOverviewClient user={user} orders={orders} />;
}

