"use client";

import { useState, useMemo } from 'react';
import { useCategoriesStore, Category } from '@/store/categories.store';
import { useProductsStore } from '@/store/products.store';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, Tag, FolderTree } from 'lucide-react';
import { CategoryModal } from '@/components/admin/CategoryModal';

export default function CategoriesClient() {
  const { categories, remove } = useCategoriesStore();
  const products = useProductsStore(s => s.products);

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const filtered = useMemo(() => {
    return categories.filter(c => 
      c.name_fr.toLowerCase().includes(search.toLowerCase()) || 
      c.name_ar.includes(search)
    );
  }, [categories, search]);

  const handleAdd = () => {
    setEditingCategory(null);
    setModalOpen(true);
  };

  const handleEdit = (c: Category) => {
    setEditingCategory(c);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    const productsInCat = products.filter(p => p.category_id === id).length;
    if (productsInCat > 0) {
      alert(`Impossible de supprimer : cette catégorie contient ${productsInCat} produits.`);
      return;
    }
    if (confirm('Voulez-vous vraiment supprimer cette catégorie ?')) {
      remove(id);
    }
  };

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
           <h1 className="font-serif text-4xl text-emerald-950 mb-2">Structure du Catalogue</h1>
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#C9A84C]">Organisation des Collections</p>
        </div>
        <button 
          onClick={handleAdd}
          className="bg-[#0a3d2e] text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-emerald-900/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3"
        >
          <Plus size={16} /> Nouvelle Catégorie
        </button>
      </header>

      <section className="flex flex-col md:flex-row gap-6">
        <div className="relative flex-1 group">
           <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-950/20 group-focus-within:text-[#C9A84C] transition-colors" />
           <input 
             type="text"
             placeholder="Rechercher une catégorie..."
             value={search}
             onChange={e => setSearch(e.target.value)}
             className="w-full h-16 pl-16 pr-8 bg-white border border-emerald-950/5 rounded-2xl outline-none focus:border-[#C9A84C] shadow-sm font-medium text-emerald-950 transition-all"
           />
        </div>
      </section>

      <div className="bg-white rounded-[3rem] border border-emerald-950/5 shadow-2xl shadow-emerald-950/5 overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-emerald-950/5 bg-neutral-50/50">
                <th className="px-10 py-6 text-left text-[9px] font-black uppercase tracking-[0.3em] text-emerald-950/30">Désignation</th>
                <th className="px-10 py-6 text-left text-[9px] font-black uppercase tracking-[0.3em] text-emerald-950/30">Lien URL (Slug)</th>
                <th className="px-10 py-6 text-left text-[9px] font-black uppercase tracking-[0.3em] text-emerald-950/30">Produits Liés</th>
                <th className="px-10 py-6 text-right text-[9px] font-black uppercase tracking-[0.3em] text-emerald-950/30">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-950/5">
              <AnimatePresence mode="popLayout">
                {filtered.map((category) => {
                  const productCount = products.filter(p => p.category_id === category.id).length;
                  return (
                    <motion.tr 
                      layout
                      key={category.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="group hover:bg-neutral-50/50 transition-colors"
                    >
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-neutral-50 rounded-xl flex items-center justify-center text-emerald-950/10 group-hover:text-[#C9A84C] transition-colors">
                             <Tag size={20} />
                          </div>
                          <div>
                            <p className="font-serif text-lg text-emerald-950">{category.name_fr}</p>
                            <p className="text-xs font-arabic text-emerald-950/30" dir="rtl">{category.name_ar}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <code className="text-[10px] font-mono bg-neutral-50 px-3 py-1.5 rounded-lg text-emerald-950/50 border border-emerald-950/5">
                          /{category.slug}
                        </code>
                      </td>
                      <td className="px-10 py-6">
                         <div className="flex items-center gap-2">
                           <FolderTree size={14} className="text-emerald-950/20" />
                           <span className="text-sm font-bold text-emerald-950">{productCount} <span className="text-[10px] font-black opacity-30">RÉFÉRENCES</span></span>
                         </div>
                      </td>
                      <td className="px-10 py-6 text-right">
                         <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEdit(category)} className="w-10 h-10 rounded-xl bg-white border border-emerald-950/5 flex items-center justify-center text-emerald-950/40 hover:text-emerald-950 hover:border-emerald-950/20 transition-all shadow-sm">
                               <Edit2 size={14} />
                            </button>
                            <button onClick={() => handleDelete(category.id)} className="w-10 h-10 rounded-xl bg-white border border-emerald-950/5 flex items-center justify-center text-rose-300 hover:text-rose-600 hover:border-rose-100 transition-all shadow-sm">
                               <Trash2 size={14} />
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
          <div className="py-32 text-center">
             <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-100">
                <Tag size={32} />
             </div>
             <p className="font-serif text-2xl text-emerald-950/20 italic">Aucune catégorie définie.</p>
          </div>
        )}
      </div>

      <CategoryModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        category={editingCategory} 
      />
    </div>
  );
}
