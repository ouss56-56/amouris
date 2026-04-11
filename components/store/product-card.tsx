'use client'

import { Product } from '@/lib/types'
import { motion } from 'framer-motion'
import { Plus, Heart, Waves, Box, Pipette, Info } from 'lucide-react'
import { useI18n } from '@/i18n/i18n-context'
import Link from 'next/link'
import { ProductImage } from './ProductImage'
import { useCartStore } from '@/store/cart.store'
import { useWishlistStore } from '@/store/wishlist.store'
import { useCustomerAuth } from '@/store/customer-auth.store'
import { toast } from 'sonner'

interface ProductCardProps {
  product: Product & { in_stock?: boolean; variants?: any[] }
  index?: number
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { t, language } = useI18n()
  const addItem = useCartStore(s => s.addItem)
  const { items: wishlistItems, toggleItem } = useWishlistStore()
  const { customer } = useCustomerAuth()
  const isAr = language === 'ar'
  const isFavorite = wishlistItems.includes(product.id)

  const price = product.product_type === 'perfume' 
    ? product.price_per_gram 
    : product.variants?.[0]?.price || 0

  // Feature 6: Check availability instead of quantity
  const isAvailable = product.product_type === 'perfume' 
    ? ((product as any).in_stock ?? ((product as any).stock_grams ?? 0) > 0)
    : (product.variants?.some((v: any) => v.is_available || (v.stock_units ?? 0) > 0) || (product as any).flacon_variants?.some((v: any) => v.is_available || (v.stock_units ?? 0) > 0))

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (product.product_type === 'perfume') {
      addItem({
        product_id: product.id,
        product_type: 'perfume',
        name_fr: product.name_fr,
        name_ar: product.name_ar,
        slug: product.slug,
        unit_price: product.price_per_gram,
        quantity_grams: 100, // Default quick add
        total_price: product.price_per_gram * 100
      })
    }
    // For other types, they usually need variant selection, 
    // so we let the user go to the detail page.
  }

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!customer) {
      toast.error(isAr ? 'يرجى تسجيل الدخول للإضافة إلى المفضلة' : 'Veuillez vous connecter pour ajouter aux favoris')
      return
    }

    try {
      await toggleItem(product.id)
      toast.success(isFavorite 
        ? (isAr ? 'تمت الإزالة من المفضلة' : 'Retiré des favoris') 
        : (isAr ? 'تمت الإضافة إلى المفضلة' : 'Ajouté aux favoris')
      )
    } catch (err) {
      toast.error(isAr ? 'حدث خطأ ما' : 'Une erreur est survenue')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative h-full flex flex-col"
    >
      <Link href={`/product/${product.slug}`} className="flex-1 flex flex-col">
        {/* Gallery Container */}
        <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-neutral-100 group-hover:shadow-2xl group-hover:shadow-emerald-950/10 transition-all duration-700">
          <ProductImage 
            images={product.images} 
            productName={product.name_fr}
            categoryId={product.category_id}
            productType={product.product_type}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          />
          
          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
            {/* Stock status badge (Feature 6) */}
            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest backdrop-blur-md border ${isAvailable ? 'bg-emerald-400/20 text-emerald-100 border-emerald-400/20' : 'bg-rose-400/20 text-rose-100 border-rose-400/20 shadow-none'}`}>
              {isAvailable ? t('common.in_stock') : t('common.out_of_stock')}
            </span>
          </div>

          <div className="absolute top-4 right-4 z-10">
             <button 
               onClick={handleToggleFavorite}
               className={`w-8 h-8 rounded-full backdrop-blur-md border flex items-center justify-center transition-all duration-500 scale-90 group-hover:scale-100 opacity-0 group-hover:opacity-100 ${
                 isFavorite 
                   ? 'bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-500/20' 
                   : 'bg-white/10 border-white/20 text-white hover:bg-emerald-800'
               }`}
             >
               <Heart size={14} fill={isFavorite ? "currentColor" : "none"} />
             </button>
          </div>

          {/* Quick Add (Only for perfumes) */}
          {product.product_type === 'perfume' && isAvailable && (
            <button 
              onClick={handleQuickAdd}
              className="absolute bottom-4 right-4 w-12 h-12 rounded-2xl bg-white text-emerald-950 shadow-xl flex items-center justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 hover:bg-emerald-900 hover:text-white"
            >
              <Plus size={20} />
            </button>
          )}

          {/* Type Icon Overlay */}
          <div className="absolute bottom-4 left-4 p-3 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 text-white opacity-0 group-hover:opacity-100 transition-all duration-700">
            {product.product_type === 'perfume' && <Waves size={16} />}
            {product.product_type === 'flacon' && <Box size={16} />}
            {product.product_type === 'accessory' && <Pipette size={16} />}
          </div>
        </div>

        {/* Content */}
        <div className="mt-6 flex-1 flex flex-col px-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-500">
               {product.product_type === 'perfume' ? t('product.huile_badge') : product.product_type === 'accessory' ? t('nav.accessoires') : t('product.packaging_elite')}
            </span>
            <div className="h-px w-4 bg-amber-500/20" />
            {(product as any).brand && (
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest truncate max-w-[100px]">
                {isAr ? (product as any).brand.name_ar : (product as any).brand.name}
              </span>
            )}
          </div>

          <h3 className="font-serif text-xl text-gray-900 mb-1 group-hover:text-amber-600 transition-colors leading-tight">
            {product.name_fr}
          </h3>
          <p className="text-gray-400 text-xs font-arabic mb-4" dir="rtl">
            {product.name_ar}
          </p>

          <div className="mt-auto flex items-end justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-1">
                {product.product_type === 'perfume' ? t('common.per_gram') : t('common.from')}
              </span>
              <p className="font-serif text-2xl text-emerald-950">
                {price.toLocaleString()} <span className="text-xs font-normal text-gray-400 italic">{t('common.dzd')}</span>
              </p>
            </div>
            
            <div className="mb-1 text-emerald-950/20 group-hover:text-amber-500/40 transition-colors">
               {product.product_type === 'perfume' ? (
                 <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest scale-90 origin-right">
                   <Info size={10} /> {t('common.min_order_grams')}
                 </div>
               ) : (
                 <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest scale-90 origin-right">
                   {product.variants?.length || 0} {t('common.variants')}
                 </div>
               )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
