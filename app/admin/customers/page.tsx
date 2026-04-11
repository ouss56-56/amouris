import { createClient } from '@/lib/supabase/server';
import AdminCustomersClient from './AdminCustomersClient';

export default async function AdminCustomersPage() {
  const supabase = await createClient();

  const { data: customers } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  return <AdminCustomersClient initialCustomers={customers || []} />;
}
