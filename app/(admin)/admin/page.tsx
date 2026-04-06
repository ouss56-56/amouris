import { getAllOrders } from '@/lib/actions/orders';
import { getAllCustomers } from '@/lib/actions/customers';
import { getCurrentUser } from '@/lib/actions/auth';
import AdminDashboardClient from './AdminDashboardClient';
import { redirect } from 'next/navigation';

export default async function AdminDashboardPage() {
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

  return <AdminDashboardClient orders={orders} customers={customers} />;
}

