import { getOrderById } from '@/lib/actions/orders';
import { getCustomerById } from '@/lib/actions/customers';
import { getCurrentUser } from '@/lib/actions/auth';
import { getInvoiceByOrder } from '@/lib/actions/invoices';
import AdminOrderDetailClient from './AdminOrderDetailClient';
import { notFound, redirect } from 'next/navigation';

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const data = await getCurrentUser();
  
  if (!data || !data.profile) {
    redirect('/login');
  }

  // Admin access check
  if (data.profile.role !== 'admin' && data.profile.role !== 'owner') {
    redirect('/account');
  }

  const [order, invoice] = await Promise.all([
    getOrderById(params.id),
    getInvoiceByOrder(params.id)
  ]);

  if (!order) {
    notFound();
  }

  let customer = null;
  if (order.customerId !== 'guest') {
    customer = await getCustomerById(order.customerId);
  }

  return (
    <AdminOrderDetailClient 
      order={order} 
      customer={customer || undefined} 
      invoice={invoice} 
    />
  );
}
