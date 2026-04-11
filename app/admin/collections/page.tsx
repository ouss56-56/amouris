import { createClient } from '@/lib/supabase/server';
import CollectionsClient from './CollectionsClient';

export default async function AdminCollectionsPage() {
  const supabase = await createClient();

  const [
    { data: collections },
    { data: products }
  ] = await Promise.all([
    supabase.from('collections').select('*').order('created_at', { ascending: false }),
    supabase.from('products').select('id, collection_id')
  ]);

  // Enrich collections with product counts
  const collectionsWithCounts = (collections || []).map((col: any) => ({
    ...col,
    product_count: (products || []).filter((p: any) => p.collection_id === col.id).length
  }));

  return <CollectionsClient initialCollections={collectionsWithCounts} />;
}
