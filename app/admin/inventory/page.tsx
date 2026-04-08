'use client'

import { useState, useMemo, useEffect } from 'react'
import { useProductsStore, Product, FlaconVariant } from '@/store/products.store'
import { useSettingsStore } from '@/store/settings.store'
import { useCategoriesStore } from '@/store/categories.store'
import { 
  Package, Search, AlertTriangle, 
  Loader2, Minus, Plus, Filter, 
  Droplets, Box, ArrowRight, History 
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import React from 'react'

export default function AdminInventoryPage() {
  const { products, updateStockGrams, updateVariantStock, fetchProducts, isLoading } = useProductsStore()
  const { settings, fetchSettings } = useSettingsStore()
  const { categories, fetchCategories } = useCategoriesStore()
  
  const [search, setSearch] = useState('')
  const [isSaving, setIsSaving] = useState<string | null>(null)
  const [filterLowStock, setFilterLowStock] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState('all')

  const { settings, fetchSettings } = useSettingsStore()
  const { categories, fetchCategories } = useCategoriesStore()
  
  const [search, setSearch] = useState('')
  const [isSaving, setIsSaving] = useState<string | null>(null)
  const [filterLowStock, setFilterLowStock] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState('all')

  useEffect(() => {
    fetchProducts()
    fetchSettings()
    fetchCategories()
  }, [fetchProducts, fetchSettings, fetchCategories])

  const thresholdPerfume = settings.alertStockPerfume || 500
  const thresholdFlacon = settings.alertStockFlacon || 10

  const handleUpdatePerfumeStock = async (id: string, newStock: number) => {
    setIsSaving(id)
    const current = products.find(p => p.id === id)?.stock_grams || 0
    await updateStockGrams(id, newStock - current)
    setIsSaving(null)
  }

  const handleUpdateVariantStock = async (productId: string, variantId: string, newStock: number) => {
    setIsSaving(variantId)
    const prod = products.find(p => p.id === productId)
    const variant = prod?.variants?.find(v => v.id === variantId)
    const current = variant?.stock_units || 0
    await updateVariantStock(productId, variantId, newStock - current)
    setIsSaving(null)
  }

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.name_fr.toLowerCase().includes(search.toLowerCase()) || 
                          p.name_ar.includes(search);
      const matchCategory = categoryFilter === 'all' || p.category_id === categoryFilter;
      
      let matchLowStock = true;
      if (filterLowStock) {
        if (p.product_type === 'perfume') {
          matchLowStock = (p.stock_grams || 0) < thresholdPerfume;
        } else {
          matchLowStock = (p.variants || []).some(v => (v.stock_units || 0) < thresholdFlacon);
        }
      }

      return matchSearch && matchCategory && matchLowStock;
    });
  }, [products, search, categoryFilter, filterLowStock, thresholdPerfume, thresholdFlacon]);

  return (
    <div className="space-y-12 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
           <h1 className="font-serif text-4xl text-emerald-950 mb-2 font-bolditalic">Chambre Translucide</h1>
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#C9A84C]">Gestion temps réel des stocks</p>
        </div>
        <div className="flex bg-neutral-100 p-2 rounded-2xl gap-2 h-fit">
           <button 
             onClick={() => setFilterLowStock(false)}
             className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${!filterLowStock ? 'bg-emerald-950 text-white shadow-lg' : 'text-emerald-950/40 hover:text-emerald-950'}`}
           >
             Tout le stock
           </button>
           <button 
             onClick={() => setFilterLowStock(true)}
             className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${filterLowStock ? 'bg-rose-600 text-white shadow-lg' : 'text-emerald-950/40 hover:text-rose-600'}`}
           >
             <AlertTriangle size={12} /> Stock Faible
           </button>
        </div>
      </header>

      <section className="flex flex-col md:flex-row gap-6">
        <div className="relative flex-1 group">
           <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-950/20 group-focus-within:text-[#C9A84C] transition-colors" />
           <input 
             type="text"
             placeholder="Rechercher une référence..."
             value={search}
             onChange={e => setSearch(e.target.value)}
             className="w-full h-16 pl-16 pr-8 bg-white border border-emerald-950/5 rounded-2xl outline-none focus:border-[#C9A84C] shadow-sm font-medium text-emerald-950 transition-all font-sans"
           />
        </div>
        <div className="flex bg-neutral-50 p-1.5 rounded-2xl border border-emerald-950/5 h-16 items-center">
            <Filter size={16} className="text-emerald-950/20 mx-4" />
            <select 
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="bg-transparent text-[10px] font-black uppercase tracking-widest text-emerald-950 outline-none pr-8 cursor-pointer"
            >
              <option value="all">Toutes les catégories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name_fr}</option>)}
            </select>
        </div>
      </section>

      <div className="bg-white rounded-[3rem] border border-emerald-950/5 shadow-2xl shadow-emerald-950/5 overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-emerald-950/5 bg-neutral-50/50">
                <th className="px-10 py-6 text-left text-[9px] font-black uppercase tracking-[0.3em] text-emerald-950/30">Produit / Type</th>
                <th className="px-10 py-6 text-left text-[9px] font-black uppercase tracking-[0.3em] text-emerald-950/30">Volume / Modèle</th>
                <th className="px-10 py-6 text-left text-[9px] font-black uppercase tracking-[0.3em] text-emerald-950/30">Alertes</th>
                <th className="px-10 py-6 text-right text-[9px] font-black uppercase tracking-[0.3em] text-emerald-950/30">Mise à jour</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-950/5">
              <AnimatePresence mode="popLayout">
                {filtered.map((product) => {
                  if (product.product_type === 'perfume') {
                    const current = product.stock_grams || 0;
                    const isLow = current < thresholdPerfume;
                    return (
                      <motion.tr 
                        layout
                        key={product.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="group hover:bg-neutral-50/20 transition-all"
                      >
                        <td className="px-10 py-8">
                          <div className="flex items-center gap-6">
                             <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-700">
                                <Droplets size={24} />
                             </div>
                             <div>
                               <p className="font-serif text-lg font-bold text-emerald-950">{product.name_fr}</p>
                               <p className="text-[10px] font-black uppercase tracking-widest text-emerald-950/20 italic">Parfum / Huile Essentielle</p>
                             </div>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                            <span className="font-mono text-xl font-bold text-emerald-950">{current.toLocaleString()} <span className="text-[10px] font-black opacity-30">GRAMMES</span></span>
                        </td>
                        <td className="px-10 py-8">
                           {isLow ? (
                             <div className="flex items-center gap-2 text-rose-500 bg-rose-50 px-3 py-1.5 rounded-xl w-fit">
                                <AlertTriangle size={14} />
                                <span className="text-[9px] font-black uppercase tracking-widest font-sans">Stock Critique! (Refill requis)</span>
                             </div>
                           ) : (
                             <span className="text-[9px] font-black uppercase tracking-widest text-emerald-950/20">Niveau Optimal</span>
                           )}
                        </td>
                        <td className="px-10 py-8 text-right">
                           <div className="flex justify-end items-center gap-4">
                              <div className="flex items-center bg-neutral-100 rounded-xl p-1">
                                 <button onClick={() => handleUpdatePerfumeStock(product.id, current - 100)} className="w-8 h-8 rounded-lg hover:bg-white transition-all text-emerald-950/40 hover:text-emerald-950 flex items-center justify-center"><Minus size={14} /></button>
                                 <input 
                                   type="number" 
                                   value={current} 
                                   onChange={e => handleUpdatePerfumeStock(product.id, +e.target.value)}
                                   className="w-20 text-center bg-transparent font-mono font-bold text-emerald-950 outline-none"
                                 />
                                 <button onClick={() => handleUpdatePerfumeStock(product.id, current + 100)} className="w-8 h-8 rounded-lg hover:bg-white transition-all text-emerald-950/40 hover:text-emerald-950 flex items-center justify-center"><Plus size={14} /></button>
                              </div>
                              {isSaving === product.id && <Loader2 size={16} className="animate-spin text-amber-500" />}
                           </div>
                        </td>
                      </motion.tr>
                    );
                  } else {
                    return (
                      <React.Fragment key={product.id}>
                        <tr className="bg-neutral-50 border-b border-emerald-950/5">
                           <td colSpan={4} className="px-10 py-4">
                             <div className="flex items-center gap-3">
                                <Box size={16} className="text-amber-600" />
                                <p className="font-serif text-lg font-bold text-emerald-950">{product.name_fr} <span className="font-sans text-[10px] font-black text-emerald-950/20 uppercase tracking-widest ml-2">(Système de Variantes)</span></p>
                             </div>
                           </td>
                        </tr>
                        {product.variants?.map((v) => {
                          const isLow = (v.stock_units || 0) < thresholdFlacon;
                          return (
                            <motion.tr key={v.id} layout className="hover:bg-neutral-50/20 transition-all border-b border-emerald-950/5 last:border-0 font-sans">
                               <td className="px-10 py-5 pl-24">
                                  <div className="flex items-center gap-3">
                                     <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                     <p className="text-sm font-bold text-emerald-950">{v.size_ml}ml — {v.color_name} {v.shape ? `(${v.shape})` : ''}</p>
                                  </div>
                               </td>
                               <td className="px-10 py-5">
                                  <span className="font-mono text-base font-bold text-emerald-950">{(v.stock_units || 0).toLocaleString()} <span className="text-[9px] font-black opacity-30">UNITÉS</span></span>
                               </td>
                               <td className="px-10 py-5">
                                  {isLow && (
                                    <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-xl w-fit">
                                       <AlertTriangle size={14} />
                                       <span className="text-[9px] font-black uppercase tracking-widest">Stock Faible</span>
                                    </div>
                                  )}
                               </td>
                               <td className="px-10 py-5 text-right">
                                  <div className="flex justify-end items-center gap-4">
                                     <div className="flex items-center bg-neutral-100 rounded-xl p-1">
                                        <button onClick={() => handleUpdateVariantStock(product.id, v.id, (v.stock_units || 0) - 1)} className="w-8 h-8 rounded-lg hover:bg-white transition-all text-emerald-950/40 hover:text-emerald-950 flex items-center justify-center"><Minus size={14} /></button>
                                        <input 
                                          type="number" 
                                          value={v.stock_units} 
                                          onChange={e => handleUpdateVariantStock(product.id, v.id, +e.target.value)}
                                          className="w-16 text-center bg-transparent font-mono font-bold text-emerald-950 outline-none"
                                        />
                                        <button onClick={() => handleUpdateVariantStock(product.id, v.id, (v.stock_units || 0) + 1)} className="w-8 h-8 rounded-lg hover:bg-white transition-all text-emerald-950/40 hover:text-emerald-950 flex items-center justify-center"><Plus size={14} /></button>
                                     </div>
                                     {isSaving === v.id && <Loader2 size={16} className="animate-spin text-amber-500" />}
                                  </div>
                               </td>
                            </motion.tr>
                          )
                        })}
                      </React.Fragment>
                    );
                  }
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
