'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ProductImageProps {
  images?: string[]
  productName: string
  categoryId?: string
  productType: 'perfume' | 'flacon'
  className?: string
  priority?: boolean
}

const CATEGORY_GRADIENTS: Record<string, string> = {
  'cat-01': 'from-amber-900 to-amber-800', // Oud
  'cat-02': 'from-rose-900 to-pink-800',  // Floral
  'cat-03': 'from-emerald-900 to-teal-800', // Oriental
  'cat-04': 'from-sky-900 to-blue-800',   // Frais
  'cat-05': 'from-stone-800 to-stone-700', // Boisé
  'cat-06': 'from-purple-900 to-purple-800', // Musqué
  'cat-07': 'from-orange-900 to-red-800',  // Épicé
  'cat-08': 'from-yellow-800 to-amber-700', // Citrus
  'cat-09': 'from-cyan-900 to-sky-800',   // Aquatique
  'cat-10': 'from-amber-800 to-orange-700', // Ambré
}

export function ProductImage({ 
  images = [], 
  productName, 
  categoryId, 
  productType, 
  className,
  priority = false
}: ProductImageProps) {
  const [error, setError] = React.useState(false)
  
  const hasImage = !error && images && images.length > 0 && (
    images[0].startsWith('http') || 
    images[0].startsWith('data:image') || 
    images[0].startsWith('/')
  )

  const gradient = categoryId ? (CATEGORY_GRADIENTS[categoryId] || 'from-emerald-900 to-emerald-800') : 'from-emerald-900 to-emerald-800'
  
  if (hasImage) {
    return (
      <div className={cn("relative w-full h-full overflow-hidden", className)}>
        <Image
          src={images[0]}
          alt={productName}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-1000 group-hover:scale-110"
          onError={() => setError(true)}
        />
      </div>
    )
  }

  // Placeholder logic
  const initial = productType === 'perfume' ? productName.charAt(0) : 'F'

  return (
    <div className={cn(
      "relative w-full h-full overflow-hidden bg-gradient-to-br flex items-center justify-center",
      gradient,
      className
    )}>
      {/* Subtle dot pattern */}
      <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      
      {/* Central Letter */}
      <motion.span 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-white/20 font-serif text-[10rem] md:text-[15rem] select-none pointer-events-none group-hover:scale-110 transition-transform duration-1000"
      >
        {initial}
      </motion.span>

      {/* Decorative trait for flacons */}
      {productType === 'flacon' && (
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-12 h-px bg-white/10" />
      )}
    </div>
  )
}
