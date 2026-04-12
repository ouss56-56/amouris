import { fetchOrderById } from '@/lib/api/orders';
import { fetchSettings } from '@/lib/api/settings';
import AdminOrderDetailClient from './AdminOrderDetailClient';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  if (!id) {
    console.error('No ID provided to OrderDetailPage');
    notFound();
  }

  try {
    const [order, settings] = await Promise.all([
      fetchOrderById(id, supabase),
      fetchSettings(supabase)
    ]);

    if (!order) {
      console.warn(`Order not found with matching ID: ${id}`);
      notFound();
    }

    return <AdminOrderDetailClient initialOrder={order} settings={settings} />;
  } catch (error) {
    console.error('CRITICAL: Error loading order details:', error);
    notFound();
  }
}
