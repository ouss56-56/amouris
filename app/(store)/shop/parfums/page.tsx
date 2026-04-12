import { createClient } from '@/lib/supabase/server'
import ParfumsClient from './ParfumsClient'

export const dynamic = 'force-dynamic'

export default async function ParfumsPage() {
  const supabase = await createClient()

  const { data: parfums, error } = await supabase
    .from('products')
    .select(`
      id, name_fr, name_ar, slug, product_type,
      price_per_gram, images, stock_grams,
      category_id, brand_id, collection_id,
      categories ( id, name_fr, name_ar ),
      brands ( id, name, name_ar ),
      product_tags ( tags ( id, name_fr, name_ar ) )
    `)
    .eq('product_type', 'perfume')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error loading parfums:', error)
  }

  // Charger les filtres disponibles
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name_fr, name_ar')

  const { data: brands } = await supabase
    .from('brands')
    .select('id, name, name_ar')

  const { data: tags } = await supabase
    .from('tags')
    .select('id, name_fr, name_ar')

  return (
    <ParfumsClient
      initialProducts={parfums as any ?? []}
      initialCategories={categories as any ?? []}
      initialBrands={brands as any ?? []}
      initialTags={tags as any ?? []}
    />
  )
}
