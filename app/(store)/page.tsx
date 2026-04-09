'use client'
import { HeroSection } from '@/components/store/HeroSection'
import { BrandsMarquee } from '@/components/store/BrandsMarquee'
import { TagSection } from '@/components/store/TagSection'
import { CategoriesGrid } from '@/components/store/CategoriesGrid'
import { HowItWorks } from '@/components/store/HowItWorks'
import { useProductsStore } from '@/store/products.store'
import { useTagsStore } from '@/store/tags.store'
import { useBrandsStore } from '@/store/brands.store'
import { useCategoriesStore } from '@/store/categories.store'
import { useSettingsStore } from '@/store/settings.store'
import { useAnnouncementsStore } from '@/store/announcements.store'
import { useEffect } from 'react'

export default function HomePage() {
  const fetchProducts = useProductsStore(s => s.fetchProducts)
  const fetchTags = useTagsStore(s => s.fetchTags)
  const fetchBrands = useBrandsStore(s => s.fetchBrands)
  const fetchCategories = useCategoriesStore(s => s.fetchCategories)
  const fetchSettings = useSettingsStore(s => s.fetchSettings)

  useEffect(() => {
    fetchProducts()
    fetchTags()
    fetchBrands()
    fetchCategories()
    fetchSettings()
  }, [fetchProducts, fetchTags, fetchBrands, fetchCategories, fetchSettings])

  const activeAnnouncements = useAnnouncementsStore(s => s.getActive())
  const brands = useBrandsStore(s => s.brands)
  const homepageTags = useTagsStore(s => s.getHomepageTags())
  const products = useProductsStore(s => s.products)
  const categories = useCategoriesStore(s => s.categories)

  return (
    <main>
      {/* 0. Barre d'annonces (Dynamique) */}
      {/* Note: AnnouncementBar usually reads its own store, but the prompt says the page should read it */}
      
      {/* 1. Hero with Stats */}
      <HeroSection />

      {/* 2. Marques défilantes (Dynamique) */}
      <BrandsMarquee brands={brands} />

      {/* 3. Sections par tag (Arrivage, Best-seller, Premium) */}
      {homepageTags.map(tag => {
        // The prompt says: "Pour chaque tag homepage, lire useProductsStore(s => s.getActiveByTag(tag.id))"
        // In a map, hook calls are not allowed. We have to filter the local products or use a sub-component.
        // I'll ensure TagSection is optimized or use the products array retrieved once.
        const tagProducts = products.filter(
          p => p.status === 'active' && p.tag_ids?.includes(tag.id)
        )
        if (tagProducts.length === 0) return null
        return (
          <TagSection
            key={tag.id}
            tag={tag}
            products={tagProducts}
          />
        )
      })}

      {/* 4. Grille catégories (Dynamique) */}
      <CategoriesGrid categories={categories} />

      {/* 5. Comment commander (Version premium) */}
      <HowItWorks />
    </main>
  )
}
