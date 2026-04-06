import { getAllCustomers } from '@/lib/actions/customers';
import { getAllOrders } from '@/lib/actions/orders';
import { getCurrentUser } from '@/lib/actions/auth';
import AdminCustomersClient from './AdminCustomersClient';
import { redirect } from 'next/navigation';

export default async function AdminCustomersPage() {
  const data = await getCurrentUser();
  
  if (!data || !data.profile) {
    redirect('/login');
  }

  // Admin access check
  if (data.profile.role !== 'admin' && data.profile.role !== 'owner') {
    redirect('/account');
  }

  const [customers, orders] = await Promise.all([
    getAllCustomers(),
    getAllOrders()
  ]);

  return <AdminCustomersClient customers={customers} orders={orders} />;
}

