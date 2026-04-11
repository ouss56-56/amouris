import { fetchOrderById } from '@/lib/api/orders';
import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import OrderDetailClient from './OrderDetailClient';

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

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

  try {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*),
        status_history:order_status_history(*),
        customer:profiles(*)
      `)
      .eq('id', id)
      .single();

    if (orderError || !order) {
      notFound();
    }

    // Security: verify the order belongs to this customer
    if (order.customer_id && order.customer_id !== profile.id) {
      notFound();
    }

    return <OrderDetailClient order={order} />;
  } catch (err) {
    console.error('Error fetching order:', err);
    notFound();
  }
}
