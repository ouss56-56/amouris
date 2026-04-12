"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { createClient } from '@/lib/supabase/client';
import { updateBrand, createBrand } from '@/lib/api/catalogue';
import { 
  X, Loader2, Sparkles, ChevronRight, Info, Type, Globe, Store, Upload, Trash2, Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface BrandModalProps {
  brand?: any | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BrandModal({ brand, isOpen, onClose }: BrandModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'media'>('details');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const supabase = createClient();
  
  const [formData, setFormData] = useState({
    name: '',
    name_ar: '',
    logo_url: '',
    description_fr: '',
    description_ar: ''
  });

  useEffect(() => {
    if (brand && isOpen) {
      setFormData({
        name: brand.name || '',
        name_ar: brand.name_ar || '',
        logo_url: brand.logo_url || '',
        description_fr: brand.description_fr || '',
        description_ar: brand.description_ar || ''
      });
    } else if (isOpen) {
      setFormData({
        name: '',
        name_ar: '',
        logo_url: '',
        description_fr: '',
        description_ar: ''
      });
    }
    setActiveTab('details');
  }, [brand, isOpen]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image trop lourde. Maximum 2Mo.');
      return;
    }

    setIsUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const filename = `brands/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { data, error: uploadError } = await supabase.storage
        .from('brands')
        .upload(filename, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('brands')
        .getPublicUrl(filename);

      setFormData(prev => ({ ...prev, logo_url: urlData.publicUrl }));
      toast.success('Logo de la maison enregistré');
    } catch (err: any) {
      toast.error("Échec du transfert: " + err.message);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteImage = async () => {
    if (!formData.logo_url) return;
    try {
      const urlObj = new URL(formData.logo_url);
      const path = urlObj.pathname.split('/storage/v1/object/public/brands/')[1];
      if (path) {
        await supabase.storage.from('brands').remove([path]);
      }
    } catch (e) {
      console.error("Failed to delete from storage", e);
    }
    setFormData(prev => ({ ...prev, logo_url: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    let result;
    if (brand?.id) {
      result = await updateBrand(brand.id, formData);
    } else {
      result = await createBrand(formData);
    }
    
    if (result.success) {
      toast.success(brand?.id ? 'Informations de la maison mises à jour' : 'Nouvelle Maison de Parfum établie');
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
                <Store size={24} className="text-[#C9A84C]" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-serif font-bold italic">
                  {brand ? 'Éditer la Maison' : 'Nouvelle Maison'}
                </DialogTitle>
                <p className="text-emerald-100/40 text-[10px] uppercase tracking-widest font-black">Héritage & Marques Olfactives</p>
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
            { id: 'details', label: 'Identité', icon: Info },
            { id: 'media', label: 'Blason', icon: ImageIcon }
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
          <form id="brand-modal-form" onSubmit={handleSubmit} className="p-8">
            <AnimatePresence mode="wait">
              {activeTab === 'details' ? (
                <motion.div 
                  key="details" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-700 flex items-center gap-2"><Type size={12} /> Nom de la Maison</label>
                      <input 
                        required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                        placeholder="Ex: Maison Francis Kurkdjian"
                        className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-emerald-500 outline-none transition-all font-serif text-xl"
                      />
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-gray-700 text-right flex items-center justify-end gap-2">اسم الدار بالعربية <Globe size={12} /></label>
                       <input 
                         dir="rtl" value={formData.name_ar} onChange={e => setFormData({...formData, name_ar: e.target.value})}
                         placeholder="اسم الدار"
                         className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-emerald-500 outline-none transition-all font-arabic text-2xl text-right"
                       />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 flex items-center gap-2"><Info size={12} /> Histoire de la Marque (FR)</label>
                    <textarea 
                      value={formData.description_fr} onChange={e => setFormData({...formData, description_fr: e.target.value})}
                      rows={3}
                      placeholder="Décrivez l'univers et l'héritage de cette maison..."
                      className="w-full p-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-emerald-500 outline-none transition-all resize-none text-sm leading-relaxed italic"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 text-right flex items-center justify-end gap-2">قصة الدار بالعربية <Globe size={12} /></label>
                    <textarea 
                      dir="rtl" value={formData.description_ar} onChange={e => setFormData({...formData, description_ar: e.target.value})}
                      rows={3}
                      placeholder="وصف تاريخ وعالم هذه الدار..."
                      className="w-full p-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-emerald-500 outline-none transition-all resize-none font-arabic text-lg text-right italic"
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                   key="media" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                   className="space-y-6"
                >
                   <div className="aspect-square w-64 mx-auto rounded-[3rem] overflow-hidden border-2 border-dashed border-gray-100 bg-gray-50 relative group">
                      <AnimatePresence mode="wait">
                        {formData.logo_url ? (
                          <motion.div key="img" className="w-full h-full p-8 relative">
                            <img src={formData.logo_url} alt="Logo" className="w-full h-full object-contain" />
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                              <button type="button" onClick={handleDeleteImage} className="w-12 h-12 bg-rose-500 text-white rounded-2xl hover:scale-110 transition-transform flex items-center justify-center">
                                <Trash2 size={24} />
                              </button>
                            </div>
                          </motion.div>
                        ) : (
                          <motion.label key="upload" className={`w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-white transition-all ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                            <div className="w-16 h-16 rounded-3xl bg-white shadow-xl flex items-center justify-center text-emerald-900 mb-4">
                              {isUploading ? <Loader2 size={32} className="animate-spin text-emerald-600" /> : <Upload size={32} />}
                            </div>
                            <p className="font-serif text-lg italic text-emerald-950 text-center px-4">Importer le Logo / Blason</p>
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
                 Un logo clair et haute définition renforce l'identité de luxe de la maison.
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
                form="brand-modal-form" type="submit" disabled={isSubmitting || isUploading}
                className="flex-[2] h-14 rounded-xl bg-[#0a3d2e] text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-950/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : (
                  <>
                    <span>{brand ? 'Enregistrer les modifications' : 'Établir la Maison'}</span>
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
