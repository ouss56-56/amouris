"use client";

import { useState, useMemo } from 'react';
import { Category } from '@/store/categories.store';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, Tag, FolderTree } from 'lucide-react';
import { CategoryModal } from '@/components/admin/CategoryModal';
import { deleteCategoryAction } from '@/lib/actions/categories';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface CategoriesClientProps {
  initialCategories: (Category & { product_count: number })[];
}

export default function CategoriesClient({ initialCategories }: CategoriesClientProps) {
  const router = useRouter();
  const categories = initialCategories;

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

  const handleDelete = async (cat: Category & { product_count: number }) => {
    if (cat.product_count > 0) {
      toast.error(`Impossible de supprimer : cette catégorie contient ${cat.product_count} références.`);
      return;
    }
    if (confirm('Voulez-vous vraiment supprimer cette catégorie ?')) {
      try {
        const result = await deleteCategoryAction(cat.id);
        if (result.success) {
          router.refresh();
          toast.success('Catégorie supprimée');
        } else {
          toast.error('Erreur: ' + result.error);
        }
      } catch (err: any) {
        toast.error('Erreur: ' + err.message);
      }
    }
  };

  return (
    <div className="space-y-12 pb-20 font-sans">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
           <h1 className="font-serif text-5xl text-emerald-950 mb-2 font-bold italic">Structure du Catalogue</h1>
           <p className="text-[11px] font-black uppercase tracking-[0.5em] text-[#C9A84C]/80">Organisation des Collections</p>
        </motion.div>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAdd}
          className="bg-[#0a3d2e] text-white px-8 py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-emerald-900/30 hover:shadow-emerald-900/40 transition-all flex items-center gap-3"
        >
          <Plus size={18} /> Nouvelle Catégorie
        </motion.button>
      </header>

      <section className="flex flex-col md:flex-row gap-6">
        <div className="relative flex-1 group">
           <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-950/20 group-focus-within:text-[#C9A84C] transition-colors" />
           <input 
             type="text"
             placeholder="Rechercher une catégorie..."
             value={search}
             onChange={e => setSearch(e.target.value)}
             className="w-full h-16 pl-16 pr-8 bg-white border border-emerald-950/5 rounded-2xl outline-none focus:border-[#C9A84C] shadow-sm font-medium text-emerald-950 transition-all font-sans"
           />
        </div>
      </section>

      <div className="luxury-card overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-emerald-950/5 bg-neutral-50/50">
                <th className="luxury-table-header">Désignation</th>
                <th className="luxury-table-header">Lien URL (Slug)</th>
                <th className="luxury-table-header text-center">Produits Liés</th>
                <th className="luxury-table-header text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-950/5">
              <AnimatePresence mode="popLayout">
                {filtered.map((category) => {
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
                          <div className="w-12 h-12 bg-neutral-50 rounded-xl flex items-center justify-center text-emerald-950/10 group-hover:text-[#C9A84C] transition-colors overflow-hidden">
                             {category.image_url ? (
                               <img src={category.image_url} alt="" className="w-full h-full object-cover" />
                             ) : (
                               <Tag size={20} />
                             )}
                          </div>
                          <div>
                            <p className="font-serif text-xl text-emerald-950 font-bold">{category.name_fr}</p>
                            <p className="text-sm font-arabic text-emerald-950/50 text-right" dir="rtl">{category.name_ar}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <code className="text-[10px] font-mono bg-neutral-50 px-3 py-1.5 rounded-lg text-emerald-950/60 border border-emerald-950/5">
                          /{category.slug}
                        </code>
                      </td>
                      <td className="px-10 py-6">
                         <div className="flex items-center gap-2 justify-center">
                           <FolderTree size={14} className="text-emerald-950/20" />
                           <span className="text-sm font-bold text-emerald-950">{category.product_count} <span className="text-[10px] font-black opacity-30">RÉFÉRENCES</span></span>
                         </div>
                      </td>
                      <td className="px-10 py-6 text-right">
                         <div className="flex justify-end gap-3 transition-opacity">
                            <button onClick={() => handleEdit(category)} className="w-10 h-10 rounded-xl bg-white border border-emerald-950/5 flex items-center justify-center text-emerald-950/40 hover:text-emerald-950 hover:border-emerald-950/20 transition-all shadow-sm">
                               <Edit2 size={14} />
                            </button>
                            <button onClick={() => handleDelete(category)} className="w-10 h-10 rounded-xl bg-white border border-emerald-950/5 flex items-center justify-center text-rose-300 hover:text-rose-600 hover:border-rose-100 transition-all shadow-sm">
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
        onSave={() => router.refresh()}
      />
    </div>
  );
}
