import { createClient } from '@/lib/supabase/server';
import AccessoiresClient from './AccessoiresClient';

export default async function AccessoiresPage() {
  const supabase = await createClient();

  const [
    { data: products },
    { data: categories },
    { data: tags }
  ] = await Promise.all([
    supabase
      .from('products')
      .select('*, categories(*), brands(*), flacon_variants(*), product_tags(tag_id)')
      .eq('product_type', 'accessory')
      .eq('status', 'active'),
    supabase.from('categories').select('*'),
    supabase.from('tags').select('*')
  ]);

  return (
    <AccessoiresClient 
      initialProducts={products || []} 
      initialCategories={categories || []}
      initialTags={tags || []}
    />
  );
}
