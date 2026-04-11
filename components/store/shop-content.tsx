"use client";

import { useState, useMemo } from 'react';
import { useI18n } from '@/i18n/i18n-context';
import { ProductCard } from '@/components/store/product-card';
import { motion, AnimatePresence } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Product } from '@/store/products.store';
import { Category } from '@/store/categories.store';
import { Brand } from '@/store/brands.store';
import { useSearchParams } from 'next/navigation';
import { Drawer } from 'vaul';
import { SlidersHorizontal, X } from 'lucide-react';

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
    (searchParams.get('type') as 'all' | 'perfume' | 'flacon') || initialType || 'all'
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
  const searchQuery = searchParams.get('search') || '';
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  
  // Filtering logic
  const filteredProducts = useMemo(() => {
    return initialProducts.filter(p => {
      // Search logic
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = 
          p.name_fr.toLowerCase().includes(query) || 
          p.name_ar.includes(query);
        if (!matchesName) return false;
      }

      if (selectedType !== 'all' && p.product_type !== selectedType) return false;
      if (selectedCategory !== 'all' && p.category_id !== selectedCategory) return false;
      if (selectedBrand !== 'all' && p.brand_id !== selectedBrand) return false;
      if (selectedTag !== 'all' && !p.tag_ids?.includes(selectedTag)) return false;
      return true;
    });
  }, [initialProducts, selectedType, selectedCategory, selectedBrand, selectedTag, searchQuery]);

  // Count active filters
  const activeFilterCount = [selectedType !== 'all', selectedCategory !== 'all', selectedBrand !== 'all', selectedTag !== 'all'].filter(Boolean).length;

  const getHeroConfig = () => {
    switch(selectedType) {
      case 'perfume':
        return {
          title: t('shop.perfumes_title'),
          desc: t('shop.perfumes_desc'),
          bg: "bg-[#0a3d2e]",
          accent: "text-emerald-300"
        };
      case 'flacon':
        return {
          title: t('shop.flacons_title'),
          desc: t('shop.flacons_desc'),
          bg: "bg-[#1a202c]",
          accent: "text-amber-500"
        };
      default:
        return {
          title: t('shop.title'),
          desc: t('shop.description'),
          bg: "bg-[#0a3d2e]",
          accent: "text-amber-400"
        };
    }
  };

  const currentHero = getHeroConfig();

  const clearAllFilters = () => {
    setSelectedType('all');
    setSelectedCategory('all');
    setSelectedBrand('all');
    setSelectedTag('all');
  };

  // Shared filter content used in both sidebar and drawer
  const filterContent = (
    <div className="space-y-10 lg:space-y-16">
      {/* Filter Group: Category */}
      <div className="space-y-4 lg:space-y-8">
        <div className="flex items-center justify-between border-b border-emerald-950/5 pb-4">
          <h3 className="text-[10px] uppercase font-black tracking-[0.3em] text-emerald-950/20">
            {t('shop.filter_categories')}
          </h3>
        </div>
        <div className="flex flex-col gap-2">
          <FilterChip 
            label={t('shop.all_categories')} 
            active={selectedCategory === 'all'} 
            onClick={() => setSelectedCategory('all')} 
          />
          {categories.map(cat => (
            <FilterChip 
              key={cat.id}
              label={language === 'ar' ? cat.name_ar : cat.name_fr} 
              active={selectedCategory === cat.id} 
              onClick={() => setSelectedCategory(cat.id)} 
            />
          ))}
        </div>
      </div>

      {/* Filter Group: Brands */}
      <div className="space-y-4 lg:space-y-8">
        <div className="flex items-center justify-between border-b border-emerald-950/5 pb-4">
          <h3 className="text-[10px] uppercase font-black tracking-[0.3em] text-emerald-950/20">
            {t('shop.filter_brands')}
          </h3>
        </div>
        <div className="flex flex-col gap-2">
          <FilterChip 
            label={t('shop.all_brands')} 
            active={selectedBrand === 'all'} 
            onClick={() => setSelectedBrand('all')} 
          />
          {brands.map(brand => (
            <FilterChip 
              key={brand.id}
              label={language === 'ar' ? brand.name_ar : brand.name} 
              active={selectedBrand === brand.id} 
              onClick={() => setSelectedBrand(brand.id)} 
            />
          ))}
        </div>
      </div>

      {/* Filter Group: Type */}
      <div className="space-y-4 lg:space-y-8">
        <div className="flex items-center justify-between border-b border-emerald-950/5 pb-4">
          <h3 className="text-[10px] uppercase font-black tracking-[0.3em] text-emerald-950/20">
            {t('shop.filter_type')}
          </h3>
        </div>
        <div className="flex flex-col gap-2">
          {(['all', 'perfume', 'flacon'] as const).map(type => (
            <FilterChip 
              key={type}
              label={
                type === 'all' ? t('shop.all_universes') : 
                type === 'perfume' ? t('nav.perfumes') : 
                t('nav.flacons')
              } 
              active={selectedType === type} 
              onClick={() => setSelectedType(type)} 
            />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50/50">
      {/* Premium Hero Banner */}
      <section className={`relative py-12 md:py-24 overflow-hidden ${currentHero.bg} transition-colors duration-1000`}>
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 opacity-30" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 opacity-20" />
        </div>
        
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
           <motion.div
             key={selectedType}
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
           >
              <span className={`text-[10px] uppercase tracking-[0.4em] font-black mb-4 md:mb-6 block ${currentHero.accent}`}>
                Amouris L'Excellence
              </span>
              <h1 className="font-serif text-3xl sm:text-5xl md:text-7xl text-white mb-4 md:mb-8 tracking-tight">
                {currentHero.title}
              </h1>
              <p className="text-white/40 font-light text-sm md:text-xl max-w-2xl mx-auto leading-relaxed italic">
                {currentHero.desc}
              </p>
           </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-3 sm:px-6 py-8 md:py-20">
        {/* Mobile: "Filtres" button + sort */}
        <div className="lg:hidden flex items-center gap-3 mb-6">
          <button
            onClick={() => setFilterDrawerOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 min-h-[44px] bg-white border border-emerald-950/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-emerald-950/60 shadow-sm active:scale-95 transition-transform"
          >
            <SlidersHorizontal size={14} />
            {t('common.filter')}
            {activeFilterCount > 0 && (
              <span className="bg-[#0a3d2e] text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center">{activeFilterCount}</span>
            )}
          </button>
          <Select>
            <SelectTrigger className="flex-1 border-emerald-950/5 bg-white min-h-[44px] rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm">
              <SelectValue placeholder={t('common.sort')} />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-emerald-950/5">
              <SelectItem value="newest" className="text-[10px] font-black uppercase tracking-widest py-3">{t('shop.sort_newest')}</SelectItem>
              <SelectItem value="price-asc" className="text-[10px] font-black uppercase tracking-widest py-3">{t('shop.sort_price_asc')}</SelectItem>
              <SelectItem value="price-desc" className="text-[10px] font-black uppercase tracking-widest py-3">{t('shop.sort_price_desc')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
          
          {/* Desktop Sidebar Filters — hidden on mobile */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-32">
              {filterContent}
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Desktop header row */}
            <div className="hidden lg:flex flex-col sm:flex-row justify-between items-start sm:items-center mb-16 gap-8">
              <div>
                <h2 className="text-3xl font-serif text-emerald-950 mb-2">
                  {filteredProducts.length} {t('shop.available_products')}
                </h2>
                <div className="h-0.5 w-12 bg-[#C9A84C]" />
              </div>
              
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <Select>
                  <SelectTrigger className="w-full sm:w-[260px] border-emerald-950/5 bg-white h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm">
                    <SelectValue placeholder={t('shop.sort_placeholder')} />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-emerald-950/5">
                    <SelectItem value="newest" className="text-[10px] font-black uppercase tracking-widest py-3">{t('shop.sort_newest')}</SelectItem>
                    <SelectItem value="price-asc" className="text-[10px] font-black uppercase tracking-widest py-3">{t('shop.sort_price_asc')}</SelectItem>
                    <SelectItem value="price-desc" className="text-[10px] font-black uppercase tracking-widest py-3">{t('shop.sort_price_desc')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Mobile result count */}
            <div className="lg:hidden mb-4">
              <p className="text-sm text-emerald-950/40 font-medium">
                {filteredProducts.length} {t('shop.results')}
              </p>
            </div>

            {/* Product Grid: 2 cols on mobile, 2 on sm, 3 on xl */}
            <motion.div 
              layout
              className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6 xl:gap-10"
            >
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product, i) => (
                  <motion.div
                    layout
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.6, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
            
            {filteredProducts.length === 0 && (
              <div className="text-center py-20 md:py-40 bg-white border border-dashed border-emerald-950/10 rounded-2xl md:rounded-[3rem]">
                <div className="mb-8 text-emerald-950/5">
                  <svg className="w-16 h-16 md:w-24 md:h-24 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="font-serif text-xl md:text-2xl text-emerald-950/20 italic mb-2">
                  {t('shop.no_results')}
                </h3>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Mobile Filter Bottom Sheet Drawer */}
      <Drawer.Root open={filterDrawerOpen} onOpenChange={setFilterDrawerOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-[100] bg-emerald-950/40 backdrop-blur-sm" />
          <Drawer.Content className="fixed bottom-0 left-0 right-0 z-[101] bg-white rounded-t-[2rem] max-h-[85vh] outline-none">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-emerald-950/10 mt-4 mb-2" />
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 pb-4 border-b border-emerald-950/5">
              <Drawer.Title className="font-serif text-xl text-emerald-950">
                {t('shop.filter_products')}
              </Drawer.Title>
              <div className="flex items-center gap-3">
                {activeFilterCount > 0 && (
                  <button 
                    onClick={clearAllFilters}
                    className="text-[10px] font-black uppercase tracking-widest text-rose-500 min-h-[44px] flex items-center"
                  >
                    {t('shop.clear_all')}
                  </button>
                )}
                <button 
                  onClick={() => setFilterDrawerOpen(false)}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-neutral-100"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Filter Content — scrollable */}
            <div className="overflow-y-auto max-h-[60vh] px-6 py-6 no-scrollbar">
              {filterContent}
            </div>

            {/* Apply button */}
            <div className="px-6 py-4 border-t border-emerald-950/5 safe-area-bottom">
              <button 
                onClick={() => setFilterDrawerOpen(false)}
                className="w-full min-h-[48px] bg-[#0a3d2e] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] active:scale-95 transition-transform"
              >
                {t('shop.view_results').replace('{count}', filteredProducts.length.toString())}
              </button>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-start px-4 lg:px-6 py-3.5 lg:py-5 rounded-xl lg:rounded-[1.2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-700 border flex items-center justify-between group min-h-[44px] ${
        active 
          ? 'bg-[#0a3d2e] text-white border-[#0a3d2e] shadow-2xl shadow-emerald-900/20' 
          : 'bg-white text-emerald-950/30 border-emerald-950/5 hover:border-[#C9A84C] hover:text-emerald-950'
      }`}
    >
      <span>{label}</span>
      {active && <div className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]" />}
    </button>
  );
}
