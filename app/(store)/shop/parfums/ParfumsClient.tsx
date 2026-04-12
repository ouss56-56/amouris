"use client";

import { useMemo, useState } from 'react';
import { useI18n } from '@/i18n/i18n-context';
import { ProductCard } from '@/components/store/product-card';
import { motion, AnimatePresence } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { ChevronDown, Filter, X, Search } from 'lucide-react';

interface ParfumsClientProps {
  initialProducts: any[];
  initialCategories: any[];
  initialBrands: any[];
  initialTags: any[];
}

export default function ParfumsClient({ 
  initialProducts, 
  initialCategories, 
  initialBrands, 
  initialTags 
}: ParfumsClientProps) {
  const { language } = useI18n();
  const products = useMemo(() => initialProducts.map(p => ({
    ...p,
    tag_ids: p.product_tags?.map((pt: any) => pt.tag_id || pt.tags?.id) || []
  })), [initialProducts]);
  const categories = initialCategories;
  const brands = initialBrands;
  const tags = initialTags;

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isAr = language === 'ar';

  const filteredProducts = useMemo(() => {
    let result = products.filter(p => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!p.name_fr?.toLowerCase().includes(query) && !p.name_ar?.toLowerCase().includes(query)) return false;
      }
      if (selectedCategory !== 'all' && p.category_id !== selectedCategory) return false;
      if (selectedBrand !== 'all' && p.brand_id !== selectedBrand) return false;
      if (selectedTag !== 'all' && !p.tag_ids.includes(selectedTag)) return false;
      if ((p.price_per_gram || 0) > maxPrice) return false;
      return true;
    });

    if (sortBy === 'price-asc') result.sort((a, b) => (a.price_per_gram || 0) - (b.price_per_gram || 0));
    if (sortBy === 'price-desc') result.sort((a, b) => (b.price_per_gram || 0) - (a.price_per_gram || 0));
    if (sortBy === 'name-az') result.sort((a, b) => a.name_fr.localeCompare(b.name_fr));
    if (sortBy === 'newest') result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return result;
  }, [products, selectedCategory, selectedBrand, selectedTag, maxPrice, sortBy]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header Section */}
      <section className="bg-[#0a3d2e] py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        </div>
        <div className="container mx-auto px-6 relative z-10 text-center">
          <span className="text-amber-400 text-[10px] uppercase tracking-[0.4em] font-black mb-4 block">Collection Grasse & Orient</span>
          <h1 className="text-white font-serif text-5xl md:text-7xl mb-6">
            {isAr ? 'العطور والزيوت' : 'Parfums & Huiles'}
          </h1>
          <p className="text-emerald-100/70 font-light text-sm md:text-lg max-w-2xl mx-auto italic">
            {isAr 
              ? 'أفخر الزيوت العطرية العالمية - الحد الأدنى للطلب 100 جرام' 
              : 'Les plus grandes références de la parfumerie mondiale - Commande min. 100g'}
          </p>
        </div>
      </section>

      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Sidebar Filters */}
          <aside className={`fixed inset-0 z-50 lg:static lg:z-auto bg-white lg:bg-transparent transition-transform duration-500 lg:translate-x-0 ${showFilters ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'} w-full lg:w-72 shrink-0 overflow-y-auto lg:overflow-visible p-6 lg:p-0`}>
            <div className="flex lg:hidden justify-between items-center mb-8">
              <h2 className="text-emerald-950 font-serif text-2xl">Filtres</h2>
              <button onClick={() => setShowFilters(false)} className="p-2 bg-emerald-50 rounded-full text-emerald-950"><X size={20} /></button>
            </div>

            <div className="space-y-12 sticky top-32">
              {/* Category Chips */}
              <div className="space-y-6">
                <h3 className="text-[10px] uppercase font-black tracking-[0.2em] text-emerald-950/60 border-b border-emerald-950/5 pb-2">Collections</h3>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setSelectedCategory('all')} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${selectedCategory === 'all' ? 'bg-[#0a3d2e] text-white shadow-lg' : 'bg-white text-emerald-950/60 border border-emerald-950/5 hover:border-emerald-950/20'}`}>TOUT</button>
                  {categories.map(cat => (
                    <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${selectedCategory === cat.id ? 'bg-[#0a3d2e] text-white shadow-lg' : 'bg-white text-emerald-950/60 border border-emerald-950/5 hover:border-emerald-950/20'}`}>
                      {isAr ? cat.name_ar : cat.name_fr}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brands Chips */}
              <div className="space-y-6">
                <h3 className="text-[10px] uppercase font-black tracking-[0.2em] text-emerald-950/60 border-b border-emerald-950/5 pb-2">Maisons</h3>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setSelectedBrand('all')} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${selectedBrand === 'all' ? 'bg-[#0a3d2e] text-white shadow-lg' : 'bg-white text-emerald-950/60 border border-emerald-950/5 hover:border-emerald-950/20'}`}>TOUT</button>
                  {brands.map(brand => (
                    <button key={brand.id} onClick={() => setSelectedBrand(brand.id)} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${selectedBrand === brand.id ? 'bg-[#0a3d2e] text-white shadow-lg' : 'bg-white text-emerald-950/60 border border-emerald-950/5 hover:border-emerald-950/20'}`}>
                      {isAr ? brand.name_ar : brand.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Slider */}
              <div className="space-y-6">
                <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-[0.2em] text-emerald-950/60 border-b border-emerald-950/5 pb-2">
                  <span>Prix / g</span>
                  <span className="text-emerald-950">{maxPrice} DZD</span>
                </div>
                <Slider 
                  value={[maxPrice]} 
                  max={5000} 
                  step={50} 
                  onValueChange={([val]) => setMaxPrice(val)}
                  className="py-4"
                />
              </div>

              {/* Tags Chips */}
              <div className="space-y-6">
                <h3 className="text-[10px] uppercase font-black tracking-[0.2em] text-emerald-950/60 border-b border-emerald-950/5 pb-2">Ambiances</h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <button key={tag.id} onClick={() => setSelectedTag(selectedTag === tag.id ? 'all' : tag.id)} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${selectedTag === tag.id ? 'bg-[#C9A84C] text-emerald-950 shadow-lg' : 'bg-white text-emerald-950/60 border border-emerald-950/5'}`}>
                      {isAr ? tag.name_ar : tag.name_fr}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Grid Area */}
          <main className="flex-1">
            <div className="flex justify-between items-center mb-12">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
                <span className="text-xs uppercase font-black tracking-widest text-emerald-950/50 shrink-0">{filteredProducts.length} Références trouvées</span>
                <div className="relative group/sort flex-1 max-w-sm">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <Search size={14} className="text-emerald-950/40" />
                   </div>
                   <input
                     type="text"
                     placeholder={isAr ? 'ابحث...' : 'Rechercher...'}
                     value={searchQuery}
                     onChange={e => setSearchQuery(e.target.value)}
                     className="bg-white border border-emerald-950/5 pl-9 pr-4 py-2 pb-2.5 rounded-xl text-xs font-medium focus:outline-none w-full"
                   />
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <button onClick={() => setShowFilters(true)} className="lg:hidden flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-emerald-950/5 text-xs font-bold">
                  <Filter size={14} /> Filtres
                </button>
                
                <div className="relative group/sort">
                  <select 
                    value={sortBy} 
                    onChange={e => setSortBy(e.target.value)}
                    className="appearance-none bg-white border border-emerald-950/5 px-6 py-2 pb-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest focus:outline-none w-48 pr-10"
                  >
                    <option value="newest">Nouveautés</option>
                    <option value="price-asc">Prix croissant</option>
                    <option value="price-desc">Prix décroissant</option>
                    <option value="name-az">Nom A-Z</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-950/50" />
                </div>
              </div>
            </div>

            <motion.div layout className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-8 pb-32">
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product, i) => (
                  <motion.div
                    layout
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.6, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-40 border border-emerald-100 rounded-[3rem] bg-white shadow-xl shadow-emerald-900/5">
                <div className="text-emerald-100 mb-6 flex justify-center"><Filter size={64} strokeWidth={0.5} /></div>
                <p className="font-serif text-2xl text-emerald-950/30 italic">Aucune essence ne correspond à vos filtres.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
