"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { createCategoryAction, updateCategoryAction } from '@/lib/actions/categories';
import { uploadImage, deleteImage } from '@/lib/actions/storage';
import { 
  X, Loader2, Sparkles, ChevronRight, Info, Type, Globe, Hash, ImageIcon, Upload, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface CategoryModalProps {
  category?: any | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function CategoryModal({ category, isOpen, onClose, onSave }: CategoryModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'media'>('details');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    name_fr: '',
    name_ar: '',
    slug: '',
    description_fr: '',
    description_ar: '',
    image_url: ''
  });

  useEffect(() => {
    if (category && isOpen) {
      setFormData({
        name_fr: category.name_fr || '',
        name_ar: category.name_ar || '',
        slug: category.slug || '',
        description_fr: category.description_fr || '',
        description_ar: category.description_ar || '',
        image_url: category.image_url || ''
      });
    } else if (isOpen) {
      setFormData({
        name_fr: '',
        name_ar: '',
        slug: '',
        description_fr: '',
        description_ar: '',
        image_url: ''
      });
    }
    setActiveTab('details');
  }, [category, isOpen]);

  // Auto-slug only for new categories
  useEffect(() => {
    if (!category && formData.name_fr) {
      setFormData(prev => ({
        ...prev,
        slug: prev.name_fr.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      }));
    }
  }, [formData.name_fr, category]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image trop lourde. Maximum 2Mo.');
      return;
    }

    setIsUploading(true);
    try {
      const buffer = await file.arrayBuffer();
      const publicUrl = await uploadImage({
        name: file.name,
        type: file.type,
        buffer
      }, 'categories');

      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      toast.success('Image de la catégorie chargée');
    } catch (err: any) {
      console.error('Upload error:', err);
      toast.error("Échec du transfert: " + (err.message || 'Erreur inconnue'));
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteImage = async () => {
    if (!formData.image_url) return;
    try {
      await deleteImage(formData.image_url, 'categories');
    } catch (e) {
      console.error("Failed to delete from storage", e);
    }
    setFormData(prev => ({ ...prev, image_url: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    let result;
    if (category?.id) {
      result = await updateCategoryAction(category.id, formData);
    } else {
      result = await createCategoryAction(formData);
    }
    
    if (result.success) {
      toast.success(category?.id ? 'Catégorie mise à jour' : 'Nouvelle Catégorie créée');
      onSave();
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
                <Hash size={24} className="text-[#C9A84C]" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-serif font-bold italic">
                  {category ? 'Éditer l\'Açnaf' : 'Nouvelle Catégorie'}
                </DialogTitle>
                <p className="text-emerald-100/40 text-[10px] uppercase tracking-widest font-black">Structure Catalogue Amouris</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-100 px-6 bg-gray-50/50 shrink-0">
          {[
            { id: 'details', label: 'Détails', icon: Info },
            { id: 'media', label: 'Visuel', icon: ImageIcon }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${
                activeTab === tab.id 
                  ? 'border-emerald-600 text-emerald-900 bg-white' 
                  : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-100/50'
              }`}
            >
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          <form id="category-modal-form" onSubmit={handleSubmit} className="p-8">
            <AnimatePresence mode="wait">
              {activeTab === 'details' ? (
                <motion.div 
                  key="details" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-700 flex items-center gap-2"><Type size={12} /> Nom FR</label>
                      <input 
                        required value={formData.name_fr} onChange={e => setFormData({...formData, name_fr: e.target.value})}
                        placeholder="Ex: Parfums de Niche"
                        className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-emerald-500 outline-none transition-all font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-700 text-right flex items-center justify-end gap-2">اسم الصنف (بالعربية) <Globe size={12} /></label>
                      <input 
                        dir="rtl" value={formData.name_ar} onChange={e => setFormData({...formData, name_ar: e.target.value})}
                        placeholder="الصنف"
                        className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-emerald-500 outline-none transition-all font-arabic text-lg text-right"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 flex items-center gap-2"><Hash size={12} /> Identifiant URL (Slug)</label>
                    <input 
                      required value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                      className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-emerald-500 outline-none font-mono text-xs transition-all" 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 flex items-center gap-2"><Info size={12} /> Description (FR)</label>
                    <textarea 
                      value={formData.description_fr} onChange={e => setFormData({...formData, description_fr: e.target.value})}
                      rows={3}
                      className="w-full p-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-emerald-500 outline-none transition-all resize-none text-sm leading-relaxed"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 text-right flex items-center justify-end gap-2">الوصف (بالعربية) <Globe size={12} /></label>
                    <textarea 
                      dir="rtl" value={formData.description_ar} onChange={e => setFormData({...formData, description_ar: e.target.value})}
                      rows={3}
                      className="w-full p-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-emerald-500 outline-none transition-all resize-none font-arabic text-lg text-right"
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                   key="media" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                   className="space-y-6"
                >
                   <div className="aspect-square w-full max-w-[300px] mx-auto rounded-3xl overflow-hidden border-2 border-dashed border-gray-100 bg-gray-50 relative group">
                      <AnimatePresence mode="wait">
                        {formData.image_url ? (
                          <motion.div key="img" className="w-full h-full relative">
                            <img src={formData.image_url} alt="Category" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                              <button type="button" onClick={handleDeleteImage} className="w-12 h-12 bg-rose-500 text-white rounded-2xl hover:scale-110 transition-transform flex items-center justify-center">
                                <Trash2 size={24} />
                              </button>
                            </div>
                          </motion.div>
                        ) : (
                          <motion.label key="upload" className={`w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-white transition-all ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                            <div className="w-16 h-16 rounded-2xl bg-white shadow-xl flex items-center justify-center text-emerald-900 mb-4">
                              {isUploading ? <Loader2 size={32} className="animate-spin text-emerald-600" /> : <Upload size={32} />}
                            </div>
                            <p className="font-serif text-lg italic text-emerald-950">Charger une image</p>
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                          </motion.label>
                        )}
                      </AnimatePresence>
                   </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-gray-100 shrink-0">
           <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100/50 mb-8">
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-800 mb-1 flex items-center gap-2">
                 <Sparkles size={12} className="text-amber-500" /> Conseil Amouris
              </p>
              <p className="text-xs text-amber-900/60 italic leading-relaxed">
                 Définissez les piliers de votre navigation pour une expérience client fluide.
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
                form="category-modal-form" type="submit" disabled={isSubmitting || isUploading}
                className="flex-[2] h-14 rounded-xl bg-[#0a3d2e] text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-950/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : (
                  <>
                    <span>{category ? 'Enregistrer les modifications' : 'Créer l\'Açnaf'}</span>
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
