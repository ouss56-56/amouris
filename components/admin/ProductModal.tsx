"use client";

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { createClient } from '@/lib/supabase/client';
import { createProduct as apiAddProduct, updateProduct as apiUpdateProduct } from '@/lib/api/products';
import { 
  Upload, X, Plus, Trash2, Loader2, Sparkles, 
  Box, Droplets, Pipette, Eye, EyeOff, 
  ChevronRight, Info, Tag as TagIcon, LayoutGrid, Ruler,
  Palette, Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface ProductModalProps {
  product?: any | null;
  isOpen: boolean; // Using isOpen as requested by common Dialog patterns
  onClose: () => void;
  onSave: () => void;
  categories: any[];
  brands: any[];
  collections: any[];
  tags: any[];
}

export function ProductModal({ 
  product, 
  isOpen, 
  onClose, 
  onSave,
  categories, 
  brands, 
  collections, 
  tags
}: ProductModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'taxonomy' | 'inventory' | 'media'>('details');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  // Unified Form Data
  const [formData, setFormData] = useState<any>({
    product_type: 'perfume',
    name_fr: '',
    name_ar: '',
    description_fr: '',
    description_ar: '',
    status: 'active',
    category_id: '',
    brand_id: '',
    collection_id: '',
    tag_ids: [],
    price_per_gram: '',
    stock_grams: '',
    base_price: '',
    variants: [],
    images: [],
    slug: ''
  });

  useEffect(() => {
    if (product && isOpen) {
      setFormData({
        product_type: product.product_type ?? 'perfume',
        name_fr: product.name_fr ?? '',
        name_ar: product.name_ar ?? '',
        description_fr: product.description_fr ?? '',
        description_ar: product.description_ar ?? '',
        status: product.status ?? 'active',
        category_id: product.category_id ?? '',
        brand_id: product.brand_id ?? '',
        collection_id: product.collection_id ?? '',
        tag_ids: product.tags?.map((t: any) => t.tag?.id).filter(Boolean) || product.tag_ids || [],
        price_per_gram: product.price_per_gram ?? '',
        stock_grams: product.stock_grams ?? '',
        base_price: product.base_price ?? '',
        variants: product.variants || [],
        images: product.images || [],
        slug: product.slug ?? ''
      });
    } else if (isOpen) {
      setFormData({
        product_type: 'perfume',
        name_fr: '',
        name_ar: '',
        description_fr: '',
        description_ar: '',
        status: 'active',
        category_id: categories[0]?.id ?? '',
        brand_id: '',
        collection_id: '',
        tag_ids: [],
        price_per_gram: '',
        stock_grams: '',
        base_price: '',
        variants: [],
        images: [],
        slug: ''
      });
    }
    setActiveTab('details');
    setError(null);
  }, [product, isOpen, categories]);

  // Auto-slug generation
  useEffect(() => {
    if (!product && formData.name_fr) {
      const generated = formData.name_fr
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      setFormData(f => ({ ...f, slug: generated }));
    }
  }, [formData.name_fr, product]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Image trop lourde. Maximum 2Mo.');
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Format non supporté. Utiliser JPG, PNG ou WEBP.');
      return;
    }

    setIsUploadingImage(true);
    try {
      const ext = file.name.split('.').pop();
      const filename = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { data, error: uploadError } = await supabase.storage
        .from('products')
        .upload(filename, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('products')
        .getPublicUrl(filename);

      setFormData(f => ({
        ...f,
        images: [...f.images, urlData.publicUrl]
      }));
    } catch (err: any) {
      console.error('Upload error:', err);
      alert('Erreur lors de l\'upload : ' + err.message);
    } finally {
      setIsUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleDeleteImage = async (url: string, index: number) => {
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname.split('/storage/v1/object/public/products/')[1];
      if (path) {
        await supabase.storage.from('products').remove([path]);
      }
    } catch (e) {
      console.error("Failed to delete from storage", e);
    }
    setFormData(f => ({
      ...f,
      images: f.images.filter((_: string, i: number) => i !== index)
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name_fr.trim()) {
      setError('Le nom français est requis');
      setActiveTab('details');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        name_fr: formData.name_fr.trim(),
        name_ar: formData.name_ar.trim(),
        description_fr: formData.description_fr.trim(),
        description_ar: formData.description_ar.trim(),
        price_per_gram: formData.product_type === 'perfume' ? Number(formData.price_per_gram) : null,
        stock_grams: formData.product_type === 'perfume' ? Number(formData.stock_grams) : null,
        base_price: formData.product_type !== 'perfume' ? Number(formData.base_price || 0) : null,
        variants: formData.product_type !== 'perfume' ? formData.variants : [],
      };

      if (product) {
        await apiUpdateProduct(product.id, payload);
      } else {
        await apiAddProduct(payload);
      }
      toast.success(product ? 'Produit mis à jour avec succès' : 'Produit créé avec succès');
      onSave();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] p-0 overflow-hidden bg-white rounded-3xl border-none shadow-2xl font-sans flex flex-col">
        {/* Header Vert Émeraude */}
        <div className="bg-[#0a3d2e] p-8 text-white relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-3xl -mr-16 -mt-16" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10">
                {formData.product_type === 'perfume' ? <Droplets size={24} className="text-emerald-400" /> : <Box size={24} className="text-amber-400" />}
              </div>
              <div>
                <DialogTitle className="text-2xl font-serif font-bold italic">
                  {product ? 'Modification Boutique' : 'Nouvelle Référence'}
                </DialogTitle>
                <p className="text-emerald-100/40 text-[10px] uppercase tracking-widest font-black">Gestion Master Catalogue Amouris</p>
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
            { id: 'taxonomy', label: 'Taxonomie', icon: TagIcon },
            { id: 'inventory', label: 'Inventaire', icon: Ruler },
            { id: 'media', label: 'Médias', icon: Layers }
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

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <form id="product-modal-form" onSubmit={handleSave} className="p-8">
            <AnimatePresence mode="wait">
              {activeTab === 'details' && (
                <motion.div 
                  key="details" 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {/* Type Switcher */}
                  {!product && (
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Classification Catalogue</label>
                      <div className="flex p-1.5 bg-gray-100 rounded-2xl w-full">
                        {[
                          { id: 'perfume', label: 'Huile / Parfum' },
                          { id: 'flacon', label: 'Flacon Vide' },
                          { id: 'accessory', label: 'Accessoire' }
                        ].map(t => (
                          <button
                            key={t.id} type="button" onClick={() => setFormData({...formData, product_type: t.id})}
                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.product_type === t.id ? 'bg-white text-emerald-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-700">Nom FR <span className="text-rose-500">*</span></label>
                      <input 
                        required value={formData.name_fr} onChange={e => setFormData({...formData, name_fr: e.target.value})}
                        className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-emerald-500 outline-none transition-all font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-700 text-right block">الاسم بالعربية</label>
                      <input 
                        dir="rtl" value={formData.name_ar} onChange={e => setFormData({...formData, name_ar: e.target.value})}
                        className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-emerald-500 outline-none transition-all font-arabic text-lg text-right"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700">Histoire Olfactive (FR)</label>
                    <textarea 
                      rows={3} value={formData.description_fr} onChange={e => setFormData({...formData, description_fr: e.target.value})}
                      className="w-full p-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-emerald-500 outline-none transition-all resize-none text-sm leading-relaxed"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 text-right block">الوصف بالتفصيل (AR)</label>
                    <textarea 
                      dir="rtl" rows={3} value={formData.description_ar} onChange={e => setFormData({...formData, description_ar: e.target.value})}
                      className="w-full p-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-emerald-500 outline-none transition-all resize-none font-arabic text-lg text-right leading-relaxed"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-700">Statut de Publication</label>
                    <div className="flex gap-4">
                      <button 
                        type="button" onClick={() => setFormData({...formData, status: 'active'})}
                        className={`flex-1 flex items-center justify-center gap-3 h-12 rounded-xl border-2 transition-all ${formData.status === 'active' ? 'border-emerald-600 bg-emerald-50 text-emerald-900' : 'border-gray-100 text-gray-400'}`}
                      >
                         <Eye size={16} /> <span className="text-[10px] font-black uppercase tracking-widest">Actif</span>
                      </button>
                      <button 
                         type="button" onClick={() => setFormData({...formData, status: 'draft'})}
                         className={`flex-1 flex items-center justify-center gap-3 h-12 rounded-xl border-2 transition-all ${formData.status === 'draft' ? 'border-amber-500 bg-amber-50 text-amber-900' : 'border-gray-100 text-gray-400'}`}
                      >
                         <EyeOff size={16} /> <span className="text-[10px] font-black uppercase tracking-widest">Brouillon</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'taxonomy' && (
                <motion.div 
                  key="taxonomy"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-xs font-bold text-gray-700">Catégorie</label>
                         <select 
                           value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})}
                           className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50 outline-none text-sm font-medium"
                         >
                            <option value="">Sélectionner</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name_fr}</option>)}
                         </select>
                      </div>
                      <div className="space-y-2">
                         <label className="text-xs font-bold text-gray-700">Marque / Maison</label>
                         <select 
                           value={formData.brand_id} onChange={e => setFormData({...formData, brand_id: e.target.value})}
                           className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50 outline-none text-sm font-medium"
                         >
                            <option value="">Toutes marques</option>
                            {brands.map(b => <option key={b.id} value={b.id}>{b.name || b.name_fr}</option>)}
                         </select>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                         <label className="text-xs font-bold text-gray-700">Collection</label>
                         <select 
                           value={formData.collection_id} onChange={e => setFormData({...formData, collection_id: e.target.value})}
                           className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50 outline-none text-sm font-medium"
                         >
                            <option value="">Sans collection</option>
                            {collections.map(col => <option key={col.id} value={col.id}>{col.name_fr}</option>)}
                         </select>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <label className="text-xs font-bold text-gray-700">Tags de mise en avant</label>
                      <div className="flex flex-wrap gap-2">
                         {tags.map(t => {
                            const isSelected = formData.tag_ids.includes(t.id);
                            return (
                               <button
                                 key={t.id} type="button"
                                 onClick={() => setFormData({
                                    ...formData,
                                    tag_ids: isSelected ? formData.tag_ids.filter((id: any) => id !== t.id) : [...formData.tag_ids, t.id]
                                 })}
                                 className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${isSelected ? 'bg-emerald-900 border-emerald-900 text-white shadow-md' : 'bg-white border-gray-100 text-gray-400 hover:border-emerald-300'}`}
                               >
                                  {t.name_fr}
                               </button>
                            );
                         })}
                      </div>
                   </div>
                </motion.div>
              )}

              {activeTab === 'inventory' && (
                <motion.div 
                   key="inventory"
                   initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                   className="space-y-8"
                >
                   {formData.product_type === 'perfume' ? (
                      <div className="grid grid-cols-2 gap-6 p-8 bg-emerald-950 rounded-3xl text-white shadow-xl relative overflow-hidden">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/5 rounded-full blur-2xl" />
                         <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Prix (DZD/g)</label>
                            <input 
                              type="number" step="0.01" value={formData.price_per_gram} onChange={e => setFormData({...formData, price_per_gram: e.target.value})}
                              className="w-full bg-transparent border-b border-emerald-800 text-3xl font-serif text-[#C9A84C] outline-none py-2"
                            />
                         </div>
                         <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Stock (g)</label>
                            <input 
                               type="number" step="0.01" value={formData.stock_grams} onChange={e => setFormData({...formData, stock_grams: e.target.value})}
                               className="w-full bg-transparent border-b border-emerald-800 text-3xl font-serif text-white outline-none py-2"
                            />
                         </div>
                      </div>
                   ) : (
                      <div className="space-y-6">
                         <div className="flex items-end justify-between px-2">
                            <div className="space-y-1">
                               <h3 className="text-lg font-serif font-bold italic text-emerald-950">Options & Variantes</h3>
                               <p className="text-[10px] uppercase font-black tracking-widest text-gray-400">Gérez les styles et contenances</p>
                            </div>
                            <button 
                               type="button"
                               onClick={() => setFormData({
                                  ...formData,
                                  variants: [...formData.variants, { id: `new_${Date.now()}`, size_ml: 50, color: '#000000', color_name: '', shape: '', price: 0, stock_units: 0 }]
                               })}
                               className="flex items-center gap-2 px-4 py-2 bg-emerald-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-800 transition-all"
                            >
                               <Plus size={14} /> Ajouter
                            </button>
                         </div>

                         <div className="space-y-4">
                            {formData.variants.length === 0 && (
                               <div className="py-12 border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center text-gray-300">
                                  <Pipette size={32} className="mb-2 opacity-20" />
                                  <p className="text-xs font-bold italic">Aucune variante enregistrée</p>
                               </div>
                            )}
                            {formData.variants.map((v: any, idx: number) => (
                               <div key={v.id || idx} className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-4 relative group">
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                     {formData.product_type === 'flacon' && (
                                        <div className="space-y-1">
                                           <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">ML</label>
                                           <input type="number" value={v.size_ml} onChange={e => {
                                              const newV = [...formData.variants];
                                              newV[idx].size_ml = +e.target.value;
                                              setFormData({...formData, variants: newV});
                                           }} className="w-full h-10 px-3 bg-white rounded-lg border border-transparent focus:border-emerald-500 outline-none text-xs font-bold" />
                                        </div>
                                     )}
                                     <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Style / Coul.</label>
                                        <input type="text" value={v.color_name} onChange={e => {
                                           const newV = [...formData.variants];
                                           newV[idx].color_name = e.target.value;
                                           setFormData({...formData, variants: newV});
                                        }} className="w-full h-10 px-3 bg-white rounded-lg border border-transparent focus:border-emerald-500 outline-none text-xs font-bold" />
                                     </div>
                                     <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Prix DZD</label>
                                        <input type="number" value={v.price} onChange={e => {
                                           const newV = [...formData.variants];
                                           newV[idx].price = +e.target.value;
                                           setFormData({...formData, variants: newV});
                                        }} className="w-full h-10 px-3 bg-white rounded-lg border border-transparent focus:border-emerald-500 outline-none text-xs font-bold text-emerald-700" />
                                     </div>
                                     <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Unités</label>
                                        <input type="number" value={v.stock_units} onChange={e => {
                                           const newV = [...formData.variants];
                                           newV[idx].stock_units = +e.target.value;
                                           setFormData({...formData, variants: newV});
                                        }} className="w-full h-10 px-3 bg-white rounded-lg border border-transparent focus:border-emerald-500 outline-none text-xs font-bold" />
                                     </div>
                                  </div>
                                  <button 
                                     type="button"
                                     onClick={() => setFormData({
                                        ...formData,
                                        variants: formData.variants.filter((_:any, i:number) => i !== idx)
                                     })}
                                     className="absolute top-4 right-4 text-gray-300 hover:text-rose-500 transition-colors"
                                  >
                                     <Trash2 size={14} />
                                  </button>
                               </div>
                            ))}
                         </div>
                      </div>
                   )}
                </motion.div>
              )}

              {activeTab === 'media' && (
                <motion.div 
                   key="media"
                   initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                   className="space-y-6"
                >
                   <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                      <AnimatePresence>
                         {formData.images.map((img: string, idx: number) => (
                            <motion.div 
                               key={img} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                               className="aspect-square rounded-2xl overflow-hidden border border-gray-100 relative group"
                            >
                               <img src={img} className="w-full h-full object-cover" alt="" />
                               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-[2px]">
                                  <button 
                                     type="button" onClick={() => handleDeleteImage(img, idx)}
                                     className="w-10 h-10 bg-rose-500 text-white rounded-xl hover:scale-110 transition-transform"
                                  >
                                     <X size={18} className="mx-auto" />
                                  </button>
                               </div>
                            </motion.div>
                         ))}
                      </AnimatePresence>

                      {formData.images.length < 3 && (
                         <label className={`aspect-square rounded-2xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-all ${isUploadingImage ? 'opacity-50 pointer-events-none' : ''}`}>
                            {isUploadingImage ? (
                               <Loader2 className="animate-spin text-emerald-600" size={24} />
                            ) : (
                               <>
                                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 mb-2">
                                     <Upload size={20} />
                                  </div>
                                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Importer</span>
                               </>
                            )}
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploadingImage} />
                         </label>
                      )}
                   </div>
                   <p className="text-[9px] text-gray-400 uppercase tracking-widest font-black text-center pt-2">Max 3 images — JPG/PNG/WEBP (2Mo max)</p>
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
                 Privilégiez des photos haute résolution sur fond neutre pour magnifier vos produits.
              </p>
           </div>

           {error && <p className="text-rose-500 text-xs font-bold mb-4 flex items-center gap-2"><Info size={14} /> {error}</p>}

           <div className="flex gap-4">
              <button 
                type="button" onClick={onClose}
                className="flex-1 h-14 rounded-xl border border-gray-200 text-gray-400 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 hover:text-gray-600 transition-all font-sans"
              >
                Annuler
              </button>
              <button 
                form="product-modal-form" type="submit" disabled={isSubmitting}
                className="flex-[2] h-14 rounded-xl bg-[#0a3d2e] text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-950/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : (
                  <>
                    <span>{product ? 'Valider les modifications' : 'Inscrire au Catalogue'}</span>
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
