import { createClient } from '@/lib/supabase/server'
import AdminProductsClient from './AdminProductsClient'

export const dynamic = 'force-dynamic'

export default async function AdminProductsPage() {
  const supabase = await createClient()

  const [
    { data: products },
    { data: categories },
    { data: brands },
    { data: collections },
    { data: tags }
  ] = await Promise.all([
    supabase
      .from('products')
      .select(`
        id, name_fr, name_ar, slug, product_type, status,
        price_per_gram, stock_grams, base_price, images, created_at,
        category_id, brand_id, collection_id,
        categories ( id, name_fr, name_ar ),
        brands ( id, name, name_ar ),
        product_tags ( tag_id, tags ( id, name_fr, name_ar ) ),
        flacon_variants ( id, size_ml, color_name, shape, price, stock_units )
      `)
      .order('created_at', { ascending: false }),
    supabase.from('categories').select('id, name_fr, name_ar'),
    supabase.from('brands').select('id, name, name_ar'),
    supabase.from('collections').select('id, name_fr, name_ar'),
    supabase.from('tags').select('id, name_fr, name_ar')
  ])

  return (
    <AdminProductsClient
      initialProducts={products as any ?? []}
      categories={categories as any ?? []}
      brands={brands as any ?? []}
      collections={collections as any ?? []}
      tags={tags as any ?? []}
    />
  )
}
