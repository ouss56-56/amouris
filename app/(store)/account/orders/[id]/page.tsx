import { getCurrentUser } from '@/lib/actions/auth';
import { getOrderById } from '@/lib/actions/orders';
import OrderDetailClient from './OrderDetailClient';
import { notFound, redirect } from 'next/navigation';

import { getInvoiceByOrder } from '@/lib/actions/invoices';

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const data = await getCurrentUser();
  
  if (!data || !data.profile) {
    redirect('/login');
  }

  const [order, invoice] = await Promise.all([
    getOrderById(params.id),
    getInvoiceByOrder(params.id)
  ]);

  if (!order) {
    notFound();
  }

  // Security check: ensure order belongs to current user
  if (order.customerId !== data.profile.id && data.profile.role !== 'admin' && data.profile.role !== 'owner') {
    redirect('/account/orders');
  }

  return <OrderDetailClient order={order} invoice={invoice} />;
}

