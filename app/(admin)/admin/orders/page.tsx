import { getAllOrders } from '@/lib/actions/orders';
import { getAllCustomers } from '@/lib/actions/customers';
import { getCurrentUser } from '@/lib/actions/auth';
import AdminOrdersClient from './AdminOrdersClient';
import { redirect } from 'next/navigation';

export default async function AdminOrdersPage() {
  const data = await getCurrentUser();
  
  if (!data || !data.profile) {
    redirect('/login');
  }

  // Admin access check
  if (data.profile.role !== 'admin' && data.profile.role !== 'owner') {
    redirect('/account');
  }

  const [orders, customers] = await Promise.all([
    getAllOrders(),
    getAllCustomers()
  ]);

  return <AdminOrdersClient orders={orders} customers={customers} />;
}

