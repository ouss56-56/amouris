import { createClient } from '@/lib/supabase/server';
import CategoriesClient from './CategoriesClient';

export default async function AdminCategoriesPage() {
  const supabase = await createClient();

  const [
    { data: categories },
    { data: products }
  ] = await Promise.all([
    supabase.from('categories').select('*').order('created_at', { ascending: false }),
    supabase.from('products').select('id, category_id')
  ]);

  // Enrich categories with product counts
  const categoriesWithCounts = (categories || []).map((cat: any) => ({
    ...cat,
    product_count: (products || []).filter((p: any) => p.category_id === cat.id).length
  }));

  return <CategoriesClient initialCategories={categoriesWithCounts} />;
}
