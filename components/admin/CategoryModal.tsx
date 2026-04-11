"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Category } from '@/store/categories.store';
import { Loader2, Tag, ChevronRight, Info, AlertCircle } from 'lucide-react';
import { createCategory, updateCategory } from '@/lib/api/categories';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface CategoryModalProps {
  category?: Category | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CategoryModal({ category, isOpen, onClose }: CategoryModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<Omit<Category, 'id'>>({
    name_fr: '',
    name_ar: '',
    slug: '',
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name_fr: category.name_fr,
        name_ar: category.name_ar,
        slug: category.slug,
      });
    } else {
      setFormData({
        name_fr: '',
        name_ar: '',
        slug: '',
      });
    }
  }, [category, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (category) {
        await updateCategory(category.id, formData);
        toast.success('Catégorie mise à jour');
      } else {
        await createCategory(formData);
        toast.success('Catégorie créée');
      }
      router.refresh();
      onClose();
    } catch (err: any) {
      console.error('Error saving category:', err);
      toast.error('Erreur: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-[#FBFBFB] rounded-[3rem] p-0 border-none shadow-[0_0_80px_rgba(0,0,0,0.15)] font-sans overflow-hidden">
        <div className="bg-[#0a3d2e] p-10 text-white relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-[80px] -mr-20 -mt-20" />
           <DialogHeader className="relative z-10 space-y-4">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10 shadow-inner">
                 <Tag size={28} className="text-[#C9A84C]" />
              </div>
              <div>
                 <DialogTitle className="font-serif text-3xl font-bold italic">
                   {category ? 'Modifier la Collection' : 'Nouvelle Collection'}
                 </DialogTitle>
                 <p className="text-emerald-100/40 text-[9px] font-black uppercase tracking-[0.4em] mt-2">Structure du Catalogue Maître</p>
              </div>
           </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-10">
           <div className="space-y-8">
              <div className="grid grid-cols-1 gap-8">
                 <div className="space-y-4">
                    <label className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-950/20 px-2 flex items-center gap-2">
                       <Info size={12} /> Nom de la Catégorie (FR)
                    </label>
                    <input 
                       required 
                       placeholder="Ex: Parfums de Niche"
                       value={formData.name_fr} 
                       onChange={e => {
                         const val = e.target.value;
                         setFormData({ 
                           ...formData, 
                           name_fr: val,
                           slug: category ? formData.slug : generateSlug(val)
                         });
                       }} 
                       className="w-full h-16 px-8 rounded-2xl bg-white border border-emerald-950/5 focus:border-[#C9A84C] outline-none font-medium text-emerald-950 shadow-sm focus:ring-4 focus:ring-emerald-900/5 transition-all text-lg" 
                    />
                 </div>

                 <div className="space-y-4 text-right">
                    <label className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-950/20 px-2 flex items-center justify-end gap-2">
                       الاسم بالعربية <AlertCircle size={12} />
                    </label>
                    <input 
                       required 
                       placeholder="اسم الفئة"
                       value={formData.name_ar} 
                       onChange={e => setFormData({ ...formData, name_ar: e.target.value })} 
                       dir="rtl" 
                       className="w-full h-16 px-8 rounded-2xl bg-white border border-emerald-950/5 focus:border-[#C9A84C] outline-none font-arabic text-2xl text-emerald-950 shadow-sm focus:ring-4 focus:ring-emerald-900/5 transition-all text-right" 
                    />
                 </div>
              </div>

              <div className="space-y-4">
                 <label className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-950/20 px-2 block">Identifiant URL (Automatique)</label>
                 <div className="relative">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-950/20 font-mono text-xs italic">/category/</div>
                    <input 
                       required 
                       value={formData.slug} 
                       onChange={e => setFormData({ ...formData, slug: generateSlug(e.target.value) })} 
                       className="w-full h-12 pl-28 pr-8 rounded-xl bg-neutral-100 border border-emerald-950/5 text-xs font-mono text-emerald-800/40 outline-none font-bold" 
                    />
                 </div>
              </div>
           </div>

           <div className="pt-10 border-t border-emerald-950/5 flex flex-col md:flex-row gap-4">
              <button 
                type="button" 
                onClick={onClose}
                className="flex-1 h-16 rounded-2xl border border-emerald-950/5 text-emerald-950/30 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-neutral-50 hover:text-emerald-950 transition-all font-sans"
              >
                Annuler
              </button>
              <button 
                type="submit" 
                disabled={isLoading}
                className="flex-[2] h-16 rounded-2xl bg-[#0a3d2e] text-white text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-emerald-900/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 group"
              >
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : (
                   <>
                     <span>{category ? 'Enregistrer les modifications' : 'Ajouter au catalogue'}</span>
                     <ChevronRight size={16} className="text-[#C9A84C] group-hover:translate-x-1 transition-transform" />
                   </>
                )}
              </button>
           </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
