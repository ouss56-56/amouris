"use client";

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useI18n } from '@/i18n/i18n-context';
import { ProductCard } from '@/components/store/product-card';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Filter, X, Pipette, Search } from 'lucide-react';

interface AccessoiresClientProps {
  initialProducts: any[];
  initialCategories: any[];
  initialTags: any[];
}

export default function AccessoiresClient({ 
  initialProducts, 
  initialCategories, 
  initialTags 
}: AccessoiresClientProps) {
  const { language, t } = useI18n();
  const products = useMemo(() => initialProducts.map(p => ({
    ...p,
    variants: p.flacon_variants?.map((v: any) => ({...v, is_available: v.stock_units > 0})) || [],
    tag_ids: p.product_tags?.map((pt: any) => pt.tag_id) || []
  })), [initialProducts]);
  const categories = initialCategories;
  const tags = initialTags;

  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || 'all');
  const [selectedTag, setSelectedTag] = useState<string>(searchParams.get('tag') || 'all');
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
      if (selectedTag !== 'all' && !p.tag_ids.includes(selectedTag)) return false;
      return true;
    });

    if (sortBy === 'price-asc') result.sort((a, b) => (a.base_price || 0) - (b.base_price || 0));
    if (sortBy === 'price-desc') result.sort((a, b) => (b.base_price || 0) - (a.base_price || 0));
    if (sortBy === 'name-az') result.sort((a, b) => a.name_fr.localeCompare(b.name_fr));
    if (sortBy === 'newest') result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return result;
  }, [products, selectedCategory, selectedTag, sortBy]);

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50">
      {/* Header Section - Premium Bordeaux/Copper Theme */}
      <section className="bg-gradient-to-br from-[#3d1a1a] to-[#2d1515] py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <Pipette className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-orange-400 w-[600px] h-[600px] rotate-12" strokeWidth={0.5} />
        </div>
        <div className="container mx-auto px-6 relative z-10 text-center">
          <span className="text-orange-400 text-[10px] uppercase tracking-[0.4em] font-black mb-4 block">Expertise & Outils Professionnels</span>
          <h1 className="text-white font-serif text-5xl md:text-7xl mb-6">
            {isAr ? 'إكسسوارات وأدوات' : 'Accessoires & Outils'}
          </h1>
          <p className="text-orange-100/40 font-light text-sm md:text-lg max-w-2xl mx-auto italic">
            {isAr 
              ? 'كل ما تحتاجه لتعبئة وتغليف عطوركم باحترافية عالية' 
              : 'Tout l’équipement indispensable pour le conditionnement professionnel de vos fragrances'}
          </p>
        </div>
      </section>

      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Sidebar Filters */}
          <aside className={`fixed inset-0 z-50 lg:static lg:z-auto bg-white lg:bg-transparent transition-transform duration-500 lg:translate-x-0 ${showFilters ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'} w-full lg:w-72 shrink-0 overflow-y-auto lg:overflow-visible p-6 lg:p-0 shadow-2xl lg:shadow-none`}>
            <div className="flex lg:hidden justify-between items-center mb-8">
              <h2 className="text-[#3d1a1a] font-serif text-2xl">Filtres</h2>
              <button onClick={() => setShowFilters(false)} className="p-2 bg-rose-50 rounded-full text-[#3d1a1a]"><X size={20} /></button>
            </div>

            <div className="space-y-12 sticky top-32">
              {/* Category Chips */}
              <div className="space-y-6">
                <h3 className="text-[10px] uppercase font-black tracking-[0.2em] text-[#3d1a1a]/40 border-b border-[#3d1a1a]/5 pb-2">Catégories</h3>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setSelectedCategory('all')} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${selectedCategory === 'all' ? 'bg-[#3d1a1a] text-white shadow-lg' : 'bg-white text-[#3d1a1a]/60 border border-[#3d1a1a]/5 hover:border-[#3d1a1a]/20'}`}>TOUT</button>
                  {categories.map(cat => (
                    <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${selectedCategory === cat.id ? 'bg-[#3d1a1a] text-white shadow-lg' : 'bg-white text-[#3d1a1a]/60 border border-[#3d1a1a]/5 hover:border-[#3d1a1a]/20'}`}>
                      {isAr ? cat.name_ar : cat.name_fr}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags Chips */}
              <div className="space-y-6">
                <h3 className="text-[10px] uppercase font-black tracking-[0.2em] text-[#3d1a1a]/40 border-b border-[#3d1a1a]/5 pb-2">Ambiances</h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <button key={tag.id} onClick={() => setSelectedTag(selectedTag === tag.id ? 'all' : tag.id)} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${selectedTag === tag.id ? 'bg-orange-500 text-white shadow-lg' : 'bg-white text-[#3d1a1a]/60 border border-[#3d1a1a]/5'}`}>
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
                <span className="text-xs uppercase font-black tracking-widest text-[#3d1a1a]/40 shrink-0">{filteredProducts.length} Références trouvées</span>
                <div className="relative group/sort flex-1 max-w-sm">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <Search size={14} className="text-[#3d1a1a]/40" />
                   </div>
                   <input
                     type="text"
                     placeholder={isAr ? 'ابحث...' : 'Rechercher...'}
                     value={searchQuery}
                     onChange={e => setSearchQuery(e.target.value)}
                     className="bg-white border border-[#3d1a1a]/5 pl-9 pr-4 py-2 pb-2.5 rounded-xl text-xs font-medium focus:outline-none w-full"
                   />
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <button onClick={() => setShowFilters(true)} className="lg:hidden flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-[#3d1a1a]/5 text-xs font-bold">
                  <Filter size={14} /> Filtres
                </button>
                
                <div className="relative group/sort">
                  <select 
                    value={sortBy} 
                    onChange={e => setSortBy(e.target.value)}
                    className="appearance-none bg-white border border-[#3d1a1a]/5 px-6 py-2 pb-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest focus:outline-none w-48 pr-10"
                  >
                    <option value="newest">Nouveautés</option>
                    <option value="price-asc">Prix croissant</option>
                    <option value="price-desc">Prix décroissant</option>
                    <option value="name-az">Nom A-Z</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#3d1a1a]/40" />
                </div>
              </div>
            </div>

            <motion.div layout className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-8 pb-32">
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
              <div className="text-center py-40 border border-[#3d1a1a]/5 rounded-[3rem] bg-white shadow-xl shadow-[#3d1a1a]/5">
                <div className="text-rose-100 mb-6 flex justify-center"><Filter size={64} strokeWidth={0.5} /></div>
                <p className="font-serif text-2xl text-[#3d1a1a]/20 italic">Aucun accessoire ne correspond à vos filtres.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
