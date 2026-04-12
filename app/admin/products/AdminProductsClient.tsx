"use client";

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Package, 
  Droplets, 
  Box, 
  Filter, 
  Eye, 
  EyeOff, 
  X 
} from 'lucide-react';
import { ProductModal } from '@/components/admin/ProductModal';
import { ProductImage } from '@/components/store/ProductImage';
import { deleteProduct, updateProduct } from '@/lib/api/products';
import { useRouter } from 'next/navigation';

interface AdminProductsClientProps {
  initialProducts: any[];
  categories: any[];
  brands: any[];
  collections: any[];
  tags: any[];
}

export default function AdminProductsClient({ 
  initialProducts, 
  categories, 
  brands, 
  collections, 
  tags 
}: AdminProductsClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'perfume' | 'flacon' | 'accessory'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft'>('all');
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Map products to ensure they have tag_ids correctly formatted
  const products = useMemo(() => {
    return initialProducts.map(p => ({
      ...p,
      tag_ids: p.tags?.map((t: any) => t.tag_id) || []
    }));
  }, [initialProducts]);

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.name_fr.toLowerCase().includes(search.toLowerCase()) || 
                          p.name_ar.includes(search);
      const matchType = typeFilter === 'all' || p.product_type === typeFilter;
      const matchCategory = categoryFilter === 'all' || p.category_id === categoryFilter;
      const matchBrand = brandFilter === 'all' || p.brand_id === brandFilter;
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchSearch && matchType && matchCategory && matchBrand && matchStatus;
    });
  }, [products, search, typeFilter, categoryFilter, brandFilter, statusFilter]);

  const handleAdd = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const handleEdit = (p: any) => {
    setEditingProduct(p);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Voulez-vous vraiment retirer ce produit du catalogue ?')) {
      try {
        await deleteProduct(id);
        router.refresh();
      } catch (err) {
        alert('Erreur lors de la suppression');
      }
    }
  };

  const toggleStatus = async (product: any) => {
    const newStatus = product.status === 'active' ? 'draft' : 'active';
    try {
      await updateProduct(product.id, { status: newStatus });
      router.refresh();
    } catch (err) {
      alert('Erreur lors du changement de statut');
    }
  };

  return (
    <div className="space-y-12 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
           <h1 className="font-serif text-5xl text-emerald-950 mb-2 font-bold italic">Catalogue Maître</h1>
           <p className="text-[11px] font-black uppercase tracking-[0.5em] text-[#C9A84C]/80">Gestion de l&apos;inventaire Amouris</p>
        </motion.div>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAdd}
          className="bg-[#0a3d2e] text-white px-8 py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-emerald-900/30 hover:shadow-emerald-900/40 transition-all flex items-center gap-3"
        >
          <Plus size={18} /> Ajouter une référence
        </motion.button>
      </header>

      {/* Filters & Search */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="relative flex-1 group">
             <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#C9A84C] transition-colors" />
             <input 
                type="text"
                placeholder="Rechercher par nom (FR/AR)..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full h-16 pl-16 pr-8 bg-white border border-emerald-950/5 rounded-2xl outline-none focus:border-[#C9A84C] shadow-sm font-medium text-emerald-950 transition-all font-sans"
             />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`h-16 px-8 rounded-2xl border flex items-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all ${showFilters ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-white border-emerald-950/5 text-gray-500 hover:text-emerald-950'}`}
          >
            <Filter size={16} /> {showFilters ? 'Fermer Filtres' : 'Filtres Avancés'}
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 p-10 bg-neutral-100/80 backdrop-blur-md rounded-[2.5rem] border border-emerald-950/5">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/50 px-2">Type de Produit</label>
                  <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)} className="w-full h-14 px-5 rounded-2xl bg-white border border-emerald-950/10 outline-none text-[11px] font-bold uppercase text-emerald-950 focus:border-[#C9A84C] transition-all">
                    <option value="all">Tous les types</option>
                    <option value="perfume">Parfums (Huiles)</option>
                    <option value="flacon">Flacons (Vides)</option>
                    <option value="accessory">Accessoires & Autres</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/50 px-2">Catégorie</label>
                  <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="w-full h-14 px-5 rounded-2xl bg-white border border-emerald-950/10 outline-none text-[11px] font-bold uppercase text-emerald-950 focus:border-[#C9A84C] transition-all">
                    <option value="all">Toutes les catégories</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name_fr}</option>)}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/50 px-2">Marque</label>
                  <select value={brandFilter} onChange={e => setBrandFilter(e.target.value)} className="w-full h-14 px-5 rounded-2xl bg-white border border-emerald-950/10 outline-none text-[11px] font-bold uppercase text-emerald-950 focus:border-[#C9A84C] transition-all">
                    <option value="all">Toutes les marques</option>
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name || b.name_fr}</option>)}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/50 px-2">Statut</label>
                  <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="w-full h-14 px-5 rounded-2xl bg-white border border-emerald-950/10 outline-none text-[11px] font-bold uppercase text-emerald-950 focus:border-[#C9A84C] transition-all">
                    <option value="all">Tous les statuts</option>
                    <option value="active">Actif</option>
                    <option value="draft">Brouillon</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <div className="luxury-card overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-emerald-950/5 bg-neutral-50/50">
                <th className="luxury-table-header">Réf / Visuel</th>
                <th className="luxury-table-header">Classification</th>
                <th className="luxury-table-header">Inventaire</th>
                <th className="luxury-table-header">Prix</th>
                <th className="luxury-table-header">Statut</th>
                <th className="luxury-table-header text-right">Contrôles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-950/5">
              <AnimatePresence mode="popLayout">
                {filtered.map((product) => {
                  const cat = categories.find(c => c.id === product.category_id);
                  const brand = brands.find(b => b.id === product.brand_id);
                  const isPerfume = product.product_type === 'perfume';
                  
                  return (
                    <motion.tr 
                      layout
                      key={product.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="group hover:bg-neutral-50/50 transition-colors"
                    >
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center text-emerald-950/20 group-hover:bg-emerald-50 group-hover:text-[#0a3d2e] transition-all overflow-hidden border border-emerald-950/5 shadow-inner">
                             <ProductImage 
                               images={product.images} 
                               productName={product.name_fr} 
                               categoryId={product.category_id} 
                               productType={product.product_type}
                               className="w-full h-full"
                             />
                          </div>
                          <div>
                            <p className="font-serif text-2xl text-emerald-950 font-bold mb-0.5">{product.name_fr}</p>
                            <p className="text-[10px] uppercase font-black tracking-widest text-[#C9A84C] italic">/{product.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <div className="space-y-1.5">
                           <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${isPerfume ? 'bg-emerald-50 text-emerald-700' : product.product_type === 'accessory' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}`}>
                             {isPerfume ? <Droplets size={10} /> : product.product_type === 'accessory' ? <Plus size={10} /> : <Box size={10} />}
                             {isPerfume ? 'Huile' : product.product_type === 'accessory' ? 'Accessoire' : 'Flacon'}
                           </span>
                           <p className="text-[10px] font-bold text-emerald-950/60 uppercase tracking-widest">
                             {product.categories?.name_fr || 'Sans catégorie'} / {product.brands?.name || product.brands?.name_fr || 'Sans marque'}
                           </p>
                        </div>
                      </td>
                      <td className="px-10 py-6 font-mono">
                         {isPerfume ? (
                           <div className="space-y-1">
                              <p className="text-sm font-bold text-emerald-950">{product.stock_grams?.toLocaleString()} <span className="text-[10px] font-black opacity-30">GR</span></p>
                              <div className="w-20 h-1 bg-neutral-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, (product.stock_grams || 0) / 10)}%` }} />
                              </div>
                           </div>
                         ) : (
                          <p className="text-sm font-bold text-emerald-950">
                            {(product.flacon_variants?.length || 0)} <span className="text-[10px] font-black opacity-30">MODÈLES</span>
                          </p>
                         )}
                      </td>
                      <td className="px-10 py-6 font-mono">
                         <p className="text-sm font-black text-[#C9A84C]">
                           {isPerfume ? `${product.price_per_gram} DZD/g` : (
                             (product.flacon_variants?.length > 0) 
                               ? `Dès ${Math.min(...product.flacon_variants.map((v: any) => v.price)).toLocaleString()} DZD`
                               : `${(product.base_price || 0).toLocaleString()} DZD`
                           )}
                         </p>
                      </td>
                      <td className="px-10 py-6">
                        <button 
                          onClick={() => toggleStatus(product)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${product.status === 'active' ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-neutral-100 text-neutral-400 hover:bg-neutral-200'}`}
                        >
                          {product.status === 'active' ? <Eye size={12} /> : <EyeOff size={12} />}
                          {product.status === 'active' ? 'Actif' : 'Brouillon'}
                        </button>
                      </td>
                      <td className="px-10 py-6 text-right">
                         <div className="flex justify-end gap-3">
                            <button onClick={() => handleEdit(product)} className="w-12 h-12 rounded-2xl bg-white border border-emerald-950/5 flex items-center justify-center text-emerald-950/40 hover:text-emerald-950 hover:border-emerald-950/20 transition-all shadow-sm">
                               <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleDelete(product.id)} className="w-12 h-12 rounded-2xl bg-white border border-emerald-950/5 flex items-center justify-center text-rose-300 hover:text-rose-600 hover:border-rose-100 transition-all shadow-sm">
                               <Trash2 size={16} />
                            </button>
                         </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-32 text-center bg-neutral-50/20">
             <div className="w-24 h-24 bg-neutral-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-emerald-100 border border-emerald-950/5">
                <Search size={40} />
             </div>
             <p className="font-serif text-3xl text-emerald-950/10 italic">Aucune référence trouvée.</p>
             <p className="text-[10px] font-black uppercase tracking-widest text-emerald-950/20 mt-2">Essayez d&apos;ajuster vos filtres</p>
          </div>
        )}
      </div>

      <ProductModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)}
        product={editingProduct}
        categories={categories}
        brands={brands}
        collections={collections}
        tags={tags}
        onSave={() => {
          setModalOpen(false);
          router.refresh();
        }}
      />
    </div>
  );
}
