"use client";

import { useState, useMemo } from 'react';
import { useI18n } from '@/i18n/i18n-context';
import { ProductCard } from '@/components/store/product-card';
import { motion, AnimatePresence } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Product, Category, Brand } from '@/lib/types';
import { useSearchParams } from 'next/navigation';

interface ShopContentProps {
  initialProducts: Product[];
  categories: Category[];
  brands: Brand[];
  initialType?: 'all' | 'perfume' | 'flacon';
}

export function ShopContent({ initialProducts, categories, brands, initialType }: ShopContentProps) {
  const { t, language } = useI18n();
  const searchParams = useSearchParams();
  
  const [selectedType, setSelectedType] = useState<'all' | 'perfume' | 'flacon'>(
    (searchParams.get('type') as any) || initialType || 'all'
  );
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get('category') || 'all'
  );
  const [selectedBrand, setSelectedBrand] = useState<string>(
    searchParams.get('brand') || 'all'
  );
  const [selectedTag, setSelectedTag] = useState<string>(
    searchParams.get('tag') || 'all'
  );
  
  // Filtering logic
  const filteredProducts = useMemo(() => {
    return initialProducts.filter(p => {
      if (selectedType !== 'all' && p.type !== selectedType) return false;
      if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) return false;
      if (selectedBrand !== 'all' && p.brandId !== selectedBrand) return false;
      if (selectedTag !== 'all' && !p.tagIds?.includes(selectedTag)) return false;
      return true;
    });
  }, [initialProducts, selectedType, selectedCategory, selectedBrand, selectedTag]);

  const heroConfig = {
    all: {
      titleFR: "La Boutique Amouris",
      titleAR: "بوتيك أموريس",
      descFR: "Découvrez l'intégralité de nos collections d'exception.",
      descAR: "اكتشف مجموعاتنا الكاملة والمميزة.",
      bg: "bg-emerald-950",
      accent: "text-amber-400"
    },
    perfume: {
      titleFR: "Huiles de Parfums",
      titleAR: "زيوت عطرية",
      descFR: "L'essence de l'élégance capturée dans nos huiles les plus pures.",
      descAR: "جوهر الأناقة المحفوف في أنقى زيوتنا العطرية.",
      bg: "bg-emerald-900",
      accent: "text-amber-300"
    },
    flacon: {
      titleFR: "Flacons & Packaging",
      titleAR: "قوارير وتغليف",
      descFR: "Des écrins de verre sculptés pour préserver vos fragrances.",
      descAR: "صناديق زجاجية منحوتة للحفاظ على عطورك.",
      bg: "bg-stone-900",
      accent: "text-amber-500"
    }
  };

  const currentHero = heroConfig[selectedType];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Premium Hero Banner */}
      <section className={`relative py-20 overflow-hidden ${currentHero.bg} transition-colors duration-1000`}>
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />
        </div>
        
        <div className="container mx-auto px-6 relative z-10 text-center">
           <motion.div
             key={selectedType}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8 }}
           >
              <span className={`text-[10px] uppercase tracking-[0.4em] font-black mb-4 block ${currentHero.accent}`}>
                Amouris Excellence
              </span>
              <h1 className="font-serif text-4xl md:text-6xl text-white mb-6">
                {language === 'ar' ? currentHero.titleAR : currentHero.titleFR}
              </h1>
              <p className="text-white/60 font-light text-sm md:text-lg max-w-2xl mx-auto leading-relaxed">
                {language === 'ar' ? currentHero.descAR : currentHero.descFR}
              </p>
           </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-16">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Redesigned Sidebar Filters - Premium Glass look */}
          <aside className="w-full lg:w-72 shrink-0 space-y-10">
            <div className="sticky top-32 space-y-12">
              
              {/* Filter Group: Category */}
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-emerald-950/5 pb-2">
                  <h3 className="text-[10px] uppercase font-black tracking-[0.2em] text-emerald-950/40">
                    {t('home.categories')}
                  </h3>
                  <div className="w-1 h-1 rounded-full bg-amber-400" />
                </div>
                <div className="space-y-3">
                  <FilterChip 
                    label={t('home.view_all')} 
                    active={selectedCategory === 'all'} 
                    onClick={() => setSelectedCategory('all')} 
                  />
                  {categories.map(cat => (
                    <FilterChip 
                      key={cat.id}
                      label={language === 'ar' ? cat.nameAR : cat.nameFR} 
                      active={selectedCategory === cat.id} 
                      onClick={() => setSelectedCategory(cat.id)} 
                    />
                  ))}
                </div>
              </div>

              {/* Filter Group: Brands */}
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-emerald-950/5 pb-2">
                  <h3 className="text-[10px] uppercase font-black tracking-[0.2em] text-emerald-950/40">
                    {t('nav.brands')}
                  </h3>
                  <div className="w-1 h-1 rounded-full bg-amber-400" />
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <FilterChip 
                    label={t('home.view_all')} 
                    active={selectedBrand === 'all'} 
                    onClick={() => setSelectedBrand('all')} 
                  />
                  {brands.map(brand => (
                    <FilterChip 
                      key={brand.id}
                      label={language === 'ar' ? brand.nameAR : brand.nameFR} 
                      active={selectedBrand === brand.id} 
                      onClick={() => setSelectedBrand(brand.id)} 
                    />
                  ))}
                </div>
              </div>

              {/* Filter Group: Type */}
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-emerald-950/5 pb-2">
                  <h3 className="text-[10px] uppercase font-black tracking-[0.2em] text-emerald-950/40">
                    {t('product.type')}
                  </h3>
                  <div className="w-1 h-1 rounded-full bg-amber-400" />
                </div>
                <div className="space-y-3">
                  {(['all', 'perfume', 'flacon'] as const).map(type => (
                    <FilterChip 
                      key={type}
                      label={type === 'all' ? t('home.view_all') : type === 'perfume' ? t('nav.perfumes') : t('nav.flacons')} 
                      active={selectedType === type} 
                      onClick={() => setSelectedType(type)} 
                    />
                  ))}
                </div>
              </div>

            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
              <div>
                <span className="text-xs font-serif italic text-emerald-950/40 block mb-1">Amouris Parfums</span>
                <h2 className="text-2xl font-serif text-emerald-950">
                  {filteredProducts.length} {t('product.related')}
                </h2>
              </div>
              
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <Select>
                  <SelectTrigger className="w-full sm:w-[240px] border-emerald-950/5 bg-white h-12 rounded-xl text-[10px] font-black uppercase tracking-widest">
                    <SelectValue placeholder="Trier par / ترتيب" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-emerald-950/5">
                    <SelectItem value="newest" className="text-[10px] font-black uppercase tracking-widest">Nouveautés</SelectItem>
                    <SelectItem value="price-asc" className="text-[10px] font-black uppercase tracking-widest">Prix croissant</SelectItem>
                    <SelectItem value="price-desc" className="text-[10px] font-black uppercase tracking-widest">Prix décroissant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <motion.div 
              layout
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8"
            >
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product, i) => (
                  <motion.div
                    layout
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
            </motion.div>
            
            {filteredProducts.length === 0 && (
              <div className="text-center py-32 bg-emerald-50/10 border border-dashed border-emerald-950/10 rounded-[3rem]">
                <div className="mb-4 text-emerald-950/10">
                  <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="font-serif text-xl text-emerald-950/40 italic">
                  Aucun trésor trouvé. لا توجد منتجات.
                </h3>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-start px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 border ${
        active 
          ? 'bg-emerald-950 text-white border-emerald-950 shadow-xl shadow-emerald-950/10' 
          : 'bg-white text-emerald-950/60 border-emerald-950/5 hover:border-amber-400 hover:text-emerald-950 hover:bg-emerald-50/30'
      }`}
    >
      {label}
    </button>
  );
}


