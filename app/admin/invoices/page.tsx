import { fetchAllOrders } from '@/lib/api/orders';
import { fetchSettings } from '@/lib/api/settings';
import InvoicesClient from './InvoicesClient';
import { createClient } from '@/lib/supabase/server';

export default async function AdminInvoicesPage() {
  const supabase = await createClient();
  const [orders, settings] = await Promise.all([
    fetchAllOrders(supabase),
    fetchSettings(supabase)
  ]);

  return <InvoicesClient initialOrders={orders} settings={settings} />;
}
