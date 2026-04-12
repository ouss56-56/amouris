import { fetchAllOrders } from '@/lib/api/orders';
import InvoicesClient from './InvoicesClient';
import { createClient } from '@/lib/supabase/server';

export default async function AdminInvoicesPage() {
  const supabase = await createClient();
  const orders = await fetchAllOrders(supabase);

  return <InvoicesClient initialOrders={orders} />;
}
