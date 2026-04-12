"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { createTagAction, updateTagAction } from '@/lib/actions/tags';
import { 
  X, Loader2, Sparkles, ChevronRight, Info, Type, Globe, Tag as TagIcon, Eye, EyeOff, Hash
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface TagModalProps {
  tag?: any | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TagModal({ tag, isOpen, onClose }: TagModalProps) {
  const [activeTab, setActiveTab] = useState<'details'>('details');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name_fr: '',
    name_ar: '',
    slug: '',
    show_on_homepage: false,
    homepage_order: 0
  });

  useEffect(() => {
    if (tag && isOpen) {
      setFormData({
        name_fr: tag.name_fr || '',
        name_ar: tag.name_ar || '',
        slug: tag.slug || '',
        show_on_homepage: tag.show_on_homepage || false,
        homepage_order: tag.homepage_order || 0
      });
    } else if (isOpen) {
      setFormData({
        name_fr: '',
        name_ar: '',
        slug: '',
        show_on_homepage: false,
        homepage_order: 0
      });
    }
  }, [tag, isOpen]);

  // Auto-slug
  useEffect(() => {
    if (!tag && formData.name_fr) {
      setFormData(prev => ({
        ...prev,
        slug: prev.name_fr.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      }));
    }
  }, [formData.name_fr, tag]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    let result;
    if (tag?.id) {
      result = await updateTagAction(tag.id, formData);
    } else {
      result = await createTagAction(formData);
    }
    
    if (result.success) {
      toast.success(tag?.id ? 'Tag mis à jour' : 'Nouveau Tag créé');
      onClose();
    } else {
      toast.error('Erreur: ' + (result.error || 'Erreur inconnue'));
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] p-0 overflow-hidden bg-white rounded-3xl border-none shadow-2xl font-sans flex flex-col">
        {/* Header Vert Émeraude */}
        <div className="bg-[#0a3d2e] p-8 text-white relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-3xl -mr-16 -mt-16" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10">
                <TagIcon size={24} className="text-[#C9A84C]" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-serif font-bold italic">
                  {tag ? 'Éditer le Marqueur' : 'Nouveau Marqueur'}
                </DialogTitle>
                <p className="text-emerald-100/40 text-[10px] uppercase tracking-widest font-black">Organisation & Tags Amouris</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-100 px-6 bg-gray-50/50 shrink-0">
          <button
            onClick={() => setActiveTab('details')}
            className="flex items-center gap-2 px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all border-b-2 border-emerald-600 text-emerald-900 bg-white"
          >
            <Info size={14} /> Détails du Marqueur
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          <form id="tag-modal-form" onSubmit={handleSubmit} className="p-8">
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700 flex items-center gap-2"><Type size={12} /> Libellé FR</label>
                  <input 
                    required value={formData.name_fr} onChange={e => setFormData({...formData, name_fr: e.target.value})}
                    placeholder="Ex: Nouveauté"
                    className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-emerald-500 outline-none transition-all font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700 text-right flex items-center justify-end gap-2">العلامة (بالعربية) <Globe size={12} /></label>
                  <input 
                    dir="rtl" value={formData.name_ar} onChange={e => setFormData({...formData, name_ar: e.target.value})}
                    placeholder="جديد"
                    className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-emerald-500 outline-none transition-all font-arabic text-lg text-right"
                  />
                </div>
              </div>

              <div className="space-y-2">
                 <label className="text-xs font-bold text-gray-700 flex items-center gap-2"><Hash size={12} /> Slug unique</label>
                 <input 
                   required value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value.toLowerCase()})}
                   className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-100 font-mono text-xs text-gray-400 outline-none" 
                   readOnly={!!tag}
                 />
              </div>

              <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 space-y-6">
                 <div className="flex items-center justify-between">
                    <div className="space-y-1">
                       <p className="text-xs font-bold text-gray-900">Mettre en avant sur l'accueil</p>
                       <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Visibility on home feed</p>
                    </div>
                    <button 
                       type="button"
                       onClick={() => setFormData({...formData, show_on_homepage: !formData.show_on_homepage})}
                       className={`w-14 h-8 rounded-full transition-all relative ${formData.show_on_homepage ? 'bg-emerald-600' : 'bg-gray-200'}`}
                    >
                       <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm ${formData.show_on_homepage ? 'left-7' : 'left-1'}`} />
                    </button>
                 </div>

                 {formData.show_on_homepage && (
                    <motion.div 
                       initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                       className="pt-4 border-t border-gray-100 space-y-2"
                    >
                       <label className="text-xs font-bold text-gray-700">Ordre d'affichage</label>
                       <input 
                          type="number" value={formData.homepage_order} onChange={e => setFormData({...formData, homepage_order: parseInt(e.target.value)})}
                          className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-white outline-none font-bold text-emerald-900"
                       />
                    </motion.div>
                 )}
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-gray-100 shrink-0">
           <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100/50 mb-8">
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-800 mb-1 flex items-center gap-2">
                 <Sparkles size={12} className="text-amber-500" /> Conseil Amouris
              </p>
              <p className="text-xs text-amber-900/60 italic leading-relaxed">
                 Utilisez les tags pour créer des sélections thématiques dynamiques sur votre page d'accueil.
              </p>
           </div>

           <div className="flex gap-4">
              <button 
                type="button" onClick={onClose}
                className="flex-1 h-14 rounded-xl border border-gray-200 text-gray-400 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 hover:text-gray-600 transition-all font-sans"
              >
                Annuler
              </button>
              <button 
                form="tag-modal-form" type="submit" disabled={isSubmitting}
                className="flex-[2] h-14 rounded-xl bg-[#0a3d2e] text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-950/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : (
                  <>
                    <span>{tag ? 'Enregistrer les modifications' : 'Établir le Marqueur'}</span>
                    <ChevronRight size={16} className="text-emerald-400" />
                  </>
                )}
              </button>
           </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
