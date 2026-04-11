import { createClient } from '@/lib/supabase/server';
import AdminOrdersClient from './AdminOrdersClient';

export default async function AdminOrdersPage() {
  const supabase = await createClient();

  const [
    { data: orders },
    { data: settings }
  ] = await Promise.all([
    supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .order('created_at', { ascending: false }),
    supabase.from('settings').select('*').limit(1).maybeSingle()
  ]);

  return <AdminOrdersClient initialOrders={orders || []} settings={settings || undefined} />;
}
