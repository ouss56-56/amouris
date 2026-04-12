import { HeroSection } from '@/components/store/HeroSection'
import { BrandsMarquee } from '@/components/store/BrandsMarquee'
import { TagSection } from '@/components/store/TagSection'
import { CategoriesGrid } from '@/components/store/CategoriesGrid'
import { HowItWorks } from '@/components/store/HowItWorks'
import { AnnouncementBar } from '@/components/store/announcement-bar'
import { ShopCards } from '@/components/store/ShopCards'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const supabase = await createClient()

  const [
    { data: tags, error: tagsError },
    { data: announcements },
    { data: brands },
    { data: categories }
  ] = await Promise.all([
    supabase
      .from('tags')
      .select('id, name_fr, name_ar, slug, homepage_order')
      .eq('show_on_homepage', true)
      .order('homepage_order', { ascending: true }),
    supabase
      .from('announcements')
      .select('id, text_fr, text_ar, display_order')
      .eq('is_active', true)
      .order('display_order', { ascending: true }),
    supabase
      .from('brands')
      .select('id, name, name_ar, logo_url'),
    supabase
      .from('categories')
      .select('id, name_fr, name_ar, slug, image_url')
  ])

  // Pour chaque tag, charger les produits associés
  const tagSections = []
  for (const tag of (tags ?? [])) {
    const { data: ptRows } = await supabase
      .from('product_tags')
      .select(`
        products (
          id, name_fr, name_ar, slug, product_type,
          price_per_gram, base_price, images, status, stock_grams,
          categories ( name_fr, name_ar ),
          brands ( name ),
          flacon_variants ( id, price, color, color_name, stock_units )
        )
      `)
      .eq('tag_id', tag.id)
      .limit(8)

    const products = (ptRows ?? [])
      .map((row: any) => row.products)
      .filter(Boolean)
      .filter((p: any) => p !== null && p.status === 'active')

    tagSections.push({ tag, products })
  }

  // Compter les produits par type pour les cartes boutique
  const { count: parfumsCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('product_type', 'perfume')
    .eq('status', 'active')

  const { count: flaconsCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('product_type', 'flacon')
    .eq('status', 'active')

  const { count: accessoiresCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('product_type', 'accessory')
    .eq('status', 'active')

  return (
    <main className="min-h-screen">
      <HeroSection />
      <ShopCards
        parfumsCount={parfumsCount ?? 0}
        flaconsCount={flaconsCount ?? 0}
        accessoiresCount={accessoiresCount ?? 0}
      />
      <BrandsMarquee brands={brands as any ?? []} />
      {tagSections.map(({ tag, products }) =>
        products.length > 0 ? (
          <TagSection key={tag.id} tag={tag as any} products={products as any[]} />
        ) : null
      )}
      <CategoriesGrid categories={categories as any ?? []} />
      <HowItWorks />
    </main>
  )
}
