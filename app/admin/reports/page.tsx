import { createClient } from '@/lib/supabase/server';
import ReportsClient from './ReportsClient';

export default async function AdminReportsPage() {
  const supabase = await createClient();

  const [
    { data: orders },
    { data: customers },
    { data: products }
  ] = await Promise.all([
    supabase.from('orders').select('*, items:order_items(*), customer:profiles(*)').order('created_at', { ascending: false }),
    supabase.from('profiles').select('*').order('created_at', { ascending: false }),
    supabase.from('products').select('*').order('created_at', { ascending: false })
  ]);

  return (
    <ReportsClient 
      orders={orders || []} 
      customers={customers || []} 
      products={products || []} 
    />
  );
}
