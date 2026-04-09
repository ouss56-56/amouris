"use client";

import { useMemo, useState } from 'react';
import { useI18n } from '@/i18n/i18n-context';
import { useProductsStore } from '@/store/products.store';
import { useShallow } from 'zustand/react/shallow';
import { ProductCard } from '@/components/store/product-card';
import { motion, AnimatePresence } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { ChevronDown, Filter, X } from 'lucide-react';

export default function FlaconsClient() {
  const { language } = useI18n();
  const products = useProductsStore(useShallow(s => s.getActiveByType('flacon')));

  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [selectedColor, setSelectedColor] = useState<string>('all');
  const [selectedShape, setSelectedShape] = useState<string>('all');
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [showFilters, setShowFilters] = useState(false);

  const isAr = language === 'ar';

  // Extract unique values from variants
  const filterOptions = useMemo(() => {
    const sizes = new Set<string>();
    const colors = new Set<string>();
    const shapes = new Set<string>();

    products.forEach(p => {
      p.variants?.forEach(v => {
        if (v.size_ml) sizes.add(`${v.size_ml}ml`);
        if (v.color_name) colors.add(v.color_name);
        if (v.shape) shapes.add(v.shape);
      });
    });

    return {
      sizes: Array.from(sizes).sort(),
      colors: Array.from(colors).sort(),
      shapes: Array.from(shapes).sort()
    };
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = products.filter(p => {
      // For flacons, we look if ANY variant matches the filters
      const matchesVariant = p.variants?.some(v => {
        const sizeMatch = selectedSize === 'all' || `${v.size_ml}ml` === selectedSize;
        const colorMatch = selectedColor === 'all' || v.color_name === selectedColor;
        const shapeMatch = selectedShape === 'all' || v.shape === selectedShape;
        const priceMatch = v.price <= maxPrice;
        return sizeMatch && colorMatch && shapeMatch && priceMatch;
      });
      return matchesVariant;
    });

    if (sortBy === 'price-asc') {
      result.sort((a, b) => {
        const minA = Math.min(...(a.variants?.map(v => v.price) || [0]));
        const minB = Math.min(...(b.variants?.map(v => v.price) || [0]));
        return minA - minB;
      });
    }
    if (sortBy === 'price-desc') {
      result.sort((a, b) => {
        const minA = Math.min(...(a.variants?.map(v => v.price) || [0]));
        const minB = Math.min(...(b.variants?.map(v => v.price) || [0]));
        return minB - minA;
      });
    }
    if (sortBy === 'name-az') result.sort((a, b) => a.name_fr.localeCompare(b.name_fr));
    if (sortBy === 'newest') result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return result;
  }, [products, selectedSize, selectedColor, selectedShape, maxPrice, sortBy]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header Section */}
      <section className="bg-[#1a202c] py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        </div>
        <div className="container mx-auto px-6 relative z-10 text-center">
          <span className="text-amber-500 text-[10px] uppercase tracking-[0.4em] font-black mb-4 block">Art de la Cristallerie</span>
          <h1 className="text-white font-serif text-5xl md:text-7xl mb-6">
            {isAr ? 'القوارير والعبوات' : 'Flacons & Vides'}
          </h1>
          <p className="text-gray-400/80 font-light text-sm md:text-lg max-w-2xl mx-auto italic">
            {isAr 
              ? 'مجموعة متنوعة من القوارير الفاخرة للاستخدامات المختلفة' 
              : 'Écrins de verre et packaging premium pour vos plus belles créations'}
          </p>
        </div>
      </section>

      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Sidebar */}
          <aside className={`fixed inset-0 z-50 lg:static lg:z-auto bg-white lg:bg-transparent transition-transform duration-500 lg:translate-x-0 ${showFilters ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'} w-full lg:w-72 shrink-0 overflow-y-auto lg:overflow-visible p-6 lg:p-0`}>
             {/* Same filter style as Parfums but with sizes/colors/shapes */}
             <div className="flex lg:hidden justify-between items-center mb-8">
              <h2 className="text-emerald-950 font-serif text-2xl">Filtres</h2>
              <button onClick={() => setShowFilters(false)} className="p-2 bg-emerald-50 rounded-full text-emerald-950"><X size={20} /></button>
            </div>

            <div className="space-y-12 sticky top-32">
              {/* Size Chips */}
              <div className="space-y-6">
                <h3 className="text-[10px] uppercase font-black tracking-[0.2em] text-emerald-950/60 border-b border-emerald-950/5 pb-2">Contenance</h3>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setSelectedSize('all')} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${selectedSize === 'all' ? 'bg-amber-600 text-white shadow-lg' : 'bg-white text-emerald-950/60 border border-emerald-950/5 hover:border-emerald-950/20'}`}>TOUT</button>
                  {filterOptions.sizes.map(size => (
                    <button key={size} onClick={() => setSelectedSize(size)} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${selectedSize === size ? 'bg-amber-600 text-white shadow-lg' : 'bg-white text-emerald-950/60 border border-emerald-950/5'}`}>
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Swatches */}
              <div className="space-y-6">
                <h3 className="text-[10px] uppercase font-black tracking-[0.2em] text-emerald-950/60 border-b border-emerald-950/5 pb-2">Coloris</h3>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setSelectedColor('all')} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${selectedColor === 'all' ? 'bg-amber-600 text-white shadow-lg' : 'bg-white text-emerald-950/40 border border-emerald-950/5 hover:border-emerald-950/20'}`}>TOUT</button>
                  {filterOptions.colors.map(color => (
                    <button 
                         key={color} 
                         onClick={() => setSelectedColor(color)} 
                         className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${selectedColor === color ? 'bg-amber-600 text-white shadow-lg' : 'bg-white text-emerald-950/40 border border-emerald-950/5'}`}
                    >{color}</button>
                  ))}
                </div>
              </div>

               {/* Shape Chips */}
               <div className="space-y-6">
                <h3 className="text-[10px] uppercase font-black tracking-[0.2em] text-emerald-950/60 border-b border-emerald-950/5 pb-2">Silhouette</h3>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setSelectedShape('all')} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${selectedShape === 'all' ? 'bg-amber-600 text-white shadow-lg' : 'bg-white text-emerald-950/40 border border-emerald-950/5 hover:border-emerald-950/20'}`}>TOUT</button>
                  {filterOptions.shapes.map(shape => (
                    <button key={shape} onClick={() => setSelectedShape(shape)} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${selectedShape === shape ? 'bg-amber-600 text-white shadow-lg' : 'bg-white text-emerald-950/40 border border-emerald-950/5'}`}>
                      {shape}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Slider */}
              <div className="space-y-6">
                <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-[0.2em] text-emerald-950/60 border-b border-emerald-950/5 pb-2">
                  <span>Prix max</span>
                  <span className="text-emerald-950">{maxPrice} DZD</span>
                </div>
                <Slider 
                  value={[maxPrice]} 
                  max={20000} 
                  step={100} 
                  onValueChange={([val]) => setMaxPrice(val)}
                  className="py-4"
                />
              </div>

            </div>
          </aside>

          {/* Grid Area */}
          <main className="flex-1">
             {/* Header bar */}
             <div className="flex justify-between items-center mb-12">
              <div>
                <span className="text-xs uppercase font-black tracking-widest text-emerald-950/50">{filteredProducts.length} Modèles trouvés</span>
              </div>
              
              <div className="flex items-center gap-4">
                <button onClick={() => setShowFilters(true)} className="lg:hidden flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-emerald-950/5 text-xs font-bold">
                  <Filter size={14} /> Filtres
                </button>
                
                <div className="relative">
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
                    transition={{ duration: 0.6, delay: i * 0.05 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-40 border border-emerald-100 rounded-[3rem] bg-white shadow-xl shadow-emerald-900/5">
                <div className="text-emerald-100 mb-6 flex justify-center"><Filter size={64} strokeWidth={0.5} /></div>
                <p className="font-serif text-2xl text-emerald-950/30 italic">Aucun flacon ne correspond à ces critères d'exception.</p>
              </div>
            )}
          </main>

        </div>
      </div>
    </div>
  );
}
