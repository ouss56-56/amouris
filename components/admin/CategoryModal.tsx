"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCategoriesStore, Category } from '@/store/categories.store';
import { Loader2, Sparkles, Tag } from 'lucide-react';

interface CategoryModalProps {
  category?: Category | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CategoryModal({ category, isOpen, onClose }: CategoryModalProps) {
  const { add, update } = useCategoriesStore();
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
        await update(category.id, formData);
      } else {
        await add(formData);
      }
      onClose();
    } catch (err) {
      console.error('Error saving category:', err);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setIsLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl bg-white rounded-[2rem] p-0 border-none shadow-2xl">
        <div className="bg-[#0a3d2e] p-8 text-white relative overflow-hidden">
           <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-400/10 rounded-full blur-[60px]" />
           <DialogHeader className="relative z-10">
              <DialogTitle className="font-serif text-2xl flex items-center gap-3">
                <Tag size={24} className="text-[#C9A84C]" />
                {category ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
              </DialogTitle>
              <p className="text-emerald-100/40 text-[9px] font-black uppercase tracking-[0.4em]">Structure du Catalogue</p>
           </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
           <div className="space-y-6">
              <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/20 px-1">Nom Français</label>
                 <input 
                    required 
                    value={formData.name_fr} 
                    onChange={e => {
                      const val = e.target.value;
                      setFormData({ 
                        ...formData, 
                        name_fr: val,
                        slug: category ? formData.slug : generateSlug(val)
                      });
                    }} 
                    className="w-full h-14 px-6 rounded-2xl bg-neutral-50 border border-emerald-950/5 focus:border-[#C9A84C] outline-none font-medium text-emerald-950 transition-colors" 
                 />
              </div>

              <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/20 px-1">Nom Arabe</label>
                 <input 
                    required 
                    value={formData.name_ar} 
                    onChange={e => setFormData({ ...formData, name_ar: e.target.value })} 
                    dir="rtl" 
                    className="w-full h-14 px-6 rounded-2xl bg-neutral-50 border border-emerald-950/5 focus:border-[#C9A84C] outline-none font-medium text-emerald-950 transition-colors font-arabic" 
                 />
              </div>

              <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/20 px-1">Slug (URL)</label>
                 <input 
                    required 
                    value={formData.slug} 
                    onChange={e => setFormData({ ...formData, slug: generateSlug(e.target.value) })} 
                    className="w-full h-12 px-6 rounded-xl bg-neutral-50 border border-emerald-950/5 text-xs font-mono text-emerald-950/40 outline-none" 
                 />
              </div>
           </div>

           <div className="pt-8 border-t border-emerald-950/5 flex gap-4">
              <button 
                type="button" 
                onClick={onClose}
                className="flex-1 h-16 rounded-2xl border border-emerald-950/5 text-emerald-950/40 text-[10px] font-black uppercase tracking-widest hover:bg-neutral-50 transition-colors"
              >
                Annuler
              </button>
              <button 
                type="submit" 
                disabled={isLoading}
                className="flex-[2] h-16 rounded-2xl bg-[#0a3d2e] text-white text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-emerald-900/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                {isLoading ? <Loader2 className="animate-spin" size={16} /> : (category ? 'Mettre à jour' : 'Ajouter au catalogue')}
              </button>
           </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
