import { createClient } from '@/lib/supabase/server';
import BrandsClient from './BrandsClient';

export default async function AdminBrandsPage() {
  const supabase = await createClient();

  const [
    { data: brands },
    { data: products }
  ] = await Promise.all([
    supabase.from('brands').select('*').order('name', { ascending: true }),
    supabase.from('products').select('id, brand_id')
  ]);

  // Enrich brands with product counts
  const brandsWithCounts = (brands || []).map((brand: any) => ({
    ...brand,
    product_count: (products || []).filter((p: any) => p.brand_id === brand.id).length
  }));

  return <BrandsClient initialBrands={brandsWithCounts} />;
}
