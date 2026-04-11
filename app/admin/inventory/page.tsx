import { createClient } from '@/lib/supabase/server';
import InventoryClient from './InventoryClient';

export default async function AdminInventoryPage() {
  const supabase = await createClient();

  const [
    { data: products },
    { data: settings },
    { data: categories }
  ] = await Promise.all([
    supabase
      .from('products')
      .select('*, category:categories(*), brand:brands(*), variants:flacon_variants(*)')
      .order('created_at', { ascending: false }),
    supabase.from('settings').select('*').limit(1).maybeSingle(),
    supabase.from('categories').select('*').order('name_fr')
  ]);

  return (
    <InventoryClient 
      initialProducts={products || []} 
      settings={settings || undefined} 
      categories={categories || []} 
    />
  );
}
