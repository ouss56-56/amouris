"use client";

import { Product } from '@/lib/types';
import { ProductCard } from '@/components/store/product-card';
import { useI18n } from '@/i18n/i18n-context';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartOff } from 'lucide-react';
import Link from 'next/link';

interface FavoritesClientProps {
  initialProducts: any[];
}

export default function FavoritesClient({ initialProducts }: FavoritesClientProps) {
  const { t, language } = useI18n();
  const isAr = language === 'ar';

  if (initialProducts.length === 0) {
    return (
      <div className="bg-white p-12 md:p-24 rounded-[3rem] text-center border border-emerald-950/5">
        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-300 mx-auto mb-6">
          <HeartOff size={40} />
        </div>
        <h2 className="font-serif text-2xl text-emerald-950 mb-4">
          {isAr ? 'قائمة المفضلة فارغة' : 'Votre liste de favoris est vide'}
        </h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          {isAr ? 'لم تقم بإضافة أي منتجات إلى المفضلة بعد. استكشف متجرنا وابحث عن منتجاتك المفضلة!' : "Vous n'avez pas encore ajouté de produits à vos favoris. Explorez notre boutique et trouvez vos coups de cœur !"}
        </p>
        <Link href="/shop">
          <button className="bg-emerald-900 text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-800 transition-colors">
            {isAr ? 'استكشف المتجر' : 'Explorer la boutique'}
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
      <AnimatePresence mode="popLayout">
        {initialProducts.map((product, i) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
