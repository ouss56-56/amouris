"use client";

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { createClient } from '@/lib/supabase/client';
import { addProduct as apiAddProduct, updateProduct as apiUpdateProduct } from '@/lib/api/products';
import { Upload, X, Plus, Trash2, Loader2, Sparkles, Box, Droplets, Pipette, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface ProductModalProps {
  product?: any | null;
  isOpen: boolean;
  onClose: () => void;
  categories: any[];
  brands: any[];
  collections: any[];
  tags: any[];
  onSave: () => void;
}

export function ProductModal({ 
  product, 
  isOpen, 
  onClose, 
  categories, 
  brands, 
  collections, 
  tags,
  onSave 
}: ProductModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [type, setType] = useState<'perfume' | 'flacon' | 'accessory'>('perfume');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<any>({
    name_fr: '',
    name_ar: '',
    description_fr: '',
    description_ar: '',
    category_id: '',
    brand_id: '',
    collection_id: '',
    tag_ids: [],
    images: [],
    status: 'active',
  });

  const [slug, setSlug] = useState('');
  const [pricePerGram, setPricePerGram] = useState<number>(0);
  const [stockGrams, setStockGrams] = useState<number>(0);
  const [variants, setVariants] = useState<any[]>([]);

  useEffect(() => {
    if (product) {
      setType(product.product_type);
      setSlug(product.slug);
      setFormData({
        name_fr: product.name_fr,
        name_ar: product.name_ar,
        description_fr: product.description_fr,
        description_ar: product.description_ar,
        category_id: product.category_id,
        brand_id: product.brand_id || '',
        collection_id: product.collection_id || '',
        tag_ids: product.tag_ids || [],
        images: product.images || [],
        status: product.status || 'active',
      });
      if (product.product_type === 'perfume') {
        setPricePerGram(product.price_per_gram || 0);
        setStockGrams(product.stock_grams || 0);
      } else {
        setVariants(product.variants || []);
      }
    } else {
      setType('perfume');
      setSlug('');
      setFormData({
        name_fr: '',
        name_ar: '',
        description_fr: '',
        description_ar: '',
        category_id: categories[0]?.id || '',
        brand_id: '',
        collection_id: '',
        tag_ids: [],
        images: [],
        status: 'active',
      });
      setPricePerGram(0);
      setStockGrams(0);
      setVariants([]);
    }
  }, [product, isOpen, categories]);

  // Auto-slug generation
  useEffect(() => {
    if (!product && formData.name_fr) {
      const generated = formData.name_fr
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      setSlug(generated);
    }
  }, [formData.name_fr, product]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newImages = [...(formData.images || [])];
    const supabase = createClient();

    for (let i = 0; i < files.length; i++) {
      if (newImages.length >= 3) break;
      const file = files[i];
      
      if (file.size > 5 * 1024 * 1024) {
        alert(`L'image ${file.name} est trop lourde. Réduire à moins de 5MB.`);
        continue;
      }

      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = product ? `${product.id}/${fileName}` : `temp/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('products')
          .getPublicUrl(filePath);

        newImages.push(publicUrl);
      } catch (err: any) {
        console.error('Error uploading image:', err);
        alert(`Erreur d'upload: ${err.message}`);
      }
    }

    setFormData({ ...formData, images: newImages });
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddVariant = () => {
    setVariants([...variants, {
      id: `v_${Date.now()}`,
      size_ml: type === 'accessory' ? 0 : 50,
      color: type === 'accessory' ? '' : '#000000',
      color_name: type === 'accessory' ? 'Standard' : 'Noir',
      shape: '',
      price: 0,
      stock_units: 0
    }]);
  };

  const handleRemoveVariant = (id: string) => {
    setVariants(variants.filter(v => v.id !== id));
  };

  const handeUpdateVariant = (id: string, updates: any) => {
    setVariants(variants.map(v => v.id === id ? { ...v, ...updates } : v));
  };

  const toggleTag = (tagId: string) => {
    const current = formData.tag_ids || [];
    if (current.includes(tagId)) {
      setFormData({ ...formData, tag_ids: current.filter(id => id !== tagId) });
    } else {
      setFormData({ ...formData, tag_ids: [...current, tagId] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data: any = {
        ...formData,
        slug,
        product_type: type,
        ...(type === 'perfume' ? { price_per_gram: pricePerGram, stock_grams: stockGrams } : { variants })
      };

      if (product) {
        await apiUpdateProduct(product.id, data);
      } else {
        await apiAddProduct(data);
      }
      onSave();
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white rounded-[2rem] p-0 border-none shadow-2xl">
        <div className="bg-[#0a3d2e] p-8 text-white relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-[80px]" />
           <DialogHeader className="relative z-10">
              <DialogTitle className="font-serif text-3xl">
                {product ? 'Modifier l\'essence' : 'Nouvelle création'}
              </DialogTitle>
              <p className="text-emerald-100/40 text-xs font-black uppercase tracking-[0.4em]">Administration Catalogue</p>
           </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-12">
           {/* Product Type Selector */}
           <div className="flex flex-wrap gap-4 p-2 bg-neutral-100 rounded-2xl w-fit">
              <button 
                type="button" 
                onClick={() => setType('perfume')}
                className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all ${type === 'perfume' ? 'bg-[#0a3d2e] text-white shadow-lg' : 'text-emerald-950/70 hover:text-emerald-950'}`}
              >
                <Droplets size={14} /> Parfum
              </button>
              <button 
                type="button" 
                onClick={() => setType('flacon')}
                className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all ${type === 'flacon' ? 'bg-[#0a3d2e] text-white shadow-lg' : 'text-emerald-950/70 hover:text-emerald-950'}`}
              >
                <Box size={14} /> Flacon
              </button>
              <button 
                type="button" 
                onClick={() => setType('accessory')}
                className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all ${type === 'accessory' ? 'bg-[#0a3d2e] text-white shadow-lg' : 'text-emerald-950/70 hover:text-emerald-950'}`}
              >
                <Pipette size={14} /> Accessoire
              </button>
           </div>

           <div className="flex gap-4 p-2 bg-neutral-100 rounded-2xl w-fit">
              <button 
                type="button" 
                onClick={() => setFormData({ ...formData, status: 'active' })}
                className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${formData.status === 'active' ? 'bg-emerald-600 text-white shadow-md' : 'text-emerald-950/70 hover:text-emerald-950'}`}
              >
                <Eye size={12} /> Actif
              </button>
              <button 
                type="button" 
                onClick={() => setFormData({ ...formData, status: 'draft' })}
                className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${formData.status === 'draft' ? 'bg-amber-600 text-white shadow-md' : 'text-emerald-950/70 hover:text-emerald-950'}`}
              >
                <EyeOff size={12} /> Brouillon
              </button>
           </div>

           {/* Core Info */}
           <section className="space-y-8">
              {/* Image Management */}
              <div className="space-y-4">
                 <label className="text-xs font-black uppercase tracking-widest text-emerald-950/60 px-1">Gestion des Visuels</label>
                 <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {formData.images?.map((img, idx) => (
                       <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-emerald-950/5 group/img">
                          <img src={img} className="w-full h-full object-cover" alt={`Product ${idx}`} />
                          <button 
                             type="button"
                             onClick={() => setFormData({ ...formData, images: formData.images?.filter((_, i) => i !== idx) })}
                             className="absolute top-2 right-2 w-8 h-8 bg-rose-500 text-white rounded-lg flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
                          >
                             <X size={14} />
                          </button>
                       </div>
                    ))}
                    
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*" 
                      className="hidden" 
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                    />

                    <button 
                      type="button"
                      disabled={isUploading || (formData.images?.length || 0) >= 3}
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-2xl border-2 border-dashed border-emerald-950/10 flex flex-col items-center justify-center gap-3 bg-neutral-50/50 hover:bg-neutral-50 transition-colors relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                       {isUploading ? <Loader2 className="animate-spin text-emerald-950/60" size={20} /> : <Upload size={20} className="text-emerald-950/60" />}
                       <span className="text-xs font-black uppercase tracking-widest text-emerald-950/60">
                         {isUploading ? 'Chargement...' : (formData.images?.length || 0) >= 3 ? 'Limite atteinte' : 'Ajouter'}
                       </span>
                    </button>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-emerald-950/60 px-1">Nom Français</label>
                    <input required value={formData.name_fr} onChange={e => setFormData({ ...formData, name_fr: e.target.value })} className="w-full h-14 px-6 rounded-2xl bg-neutral-50 border border-emerald-950/5 focus:border-[#C9A84C] outline-none font-medium text-emerald-950 transition-colors" />
                 </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-emerald-950/60 px-1">Nom Arabe</label>
                    <input required value={formData.name_ar} onChange={e => setFormData({ ...formData, name_ar: e.target.value })} dir="rtl" className="w-full h-14 px-6 rounded-2xl bg-neutral-50 border border-emerald-950/5 focus:border-[#C9A84C] outline-none font-medium text-emerald-950 transition-colors font-arabic" />
                 </div>
              </div>

              <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-emerald-950/60 px-1">Slug (URL)</label>
                  <input value={slug} onChange={e => setSlug(e.target.value)} className="w-full h-12 px-6 rounded-2xl bg-neutral-100 border border-emerald-950/5 focus:border-[#C9A84C] outline-none font-mono text-xs text-emerald-950/50 transition-colors" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-emerald-950/60 px-1">Description FR</label>
                    <textarea value={formData.description_fr} onChange={e => setFormData({ ...formData, description_fr: e.target.value })} rows={3} className="w-full p-6 rounded-2xl bg-neutral-50 border border-emerald-950/5 focus:border-[#C9A84C] outline-none font-medium text-emerald-950 transition-colors resize-none" />
                 </div>
                 <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-emerald-950/60 px-1">Description AR</label>
                    <textarea value={formData.description_ar} onChange={e => setFormData({ ...formData, description_ar: e.target.value })} rows={3} dir="rtl" className="w-full p-6 rounded-2xl bg-neutral-50 border border-emerald-950/5 focus:border-[#C9A84C] outline-none font-medium text-emerald-950 transition-colors font-arabic resize-none" />
                 </div>
              </div>
           </section>

           {/* Taxonomy */}
           <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-8">
                 <div className="space-y-4">
                    <label className="text-xs font-black uppercase tracking-widest text-emerald-950/60 px-1">Classification Boutique</label>
                    <select value={formData.category_id} onChange={e => setFormData({ ...formData, category_id: e.target.value })} className="w-full h-14 px-6 rounded-2xl bg-neutral-50 border border-emerald-950/5 outline-none text-sm font-bold text-emerald-950">
                       <option value="">Sélectionner une catégorie</option>
                       {categories.map(c => <option key={c.id} value={c.id}>{c.name_fr}</option>)}
                    </select>
                 </div>
                  <div className="space-y-4">
                    <label className="text-xs font-black uppercase tracking-widest text-emerald-950/60 px-1">Maison / Marque</label>
                    <select value={formData.brand_id || ''} onChange={e => setFormData({ ...formData, brand_id: e.target.value })} className="w-full h-14 px-6 rounded-2xl bg-neutral-50 border border-emerald-950/5 outline-none text-sm font-bold text-emerald-950">
                       <option value="">Sélectionner une marque (Optionnel)</option>
                       {brands.map(b => <option key={b.id} value={b.id}>{b.name_fr}</option>)}
                    </select>
                 </div>
              </div>

              <div className="space-y-4">
                  <label className="text-xs font-black uppercase tracking-widest text-emerald-950/60 px-1">Tags & Attributs</label>
                  <div className="flex flex-wrap gap-2">
                     {tags.map(t => (
                        <button 
                           key={t.id} 
                           type="button" 
                           onClick={() => toggleTag(t.id)}
                           className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${formData.tag_ids?.includes(t.id) ? 'bg-[#C9A84C] border-[#C9A84C] text-emerald-950' : 'bg-neutral-50 border-emerald-950/5 text-emerald-950/70'}`}
                        >
                           {t.name_fr}
                        </button>
                     ))}
                  </div>
              </div>
           </section>

           {/* Type Specific Fields */}
           <section className="p-8 md:p-12 bg-neutral-50 rounded-[2.5rem] border border-emerald-950/5">
              {type === 'perfume' ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-3">
                       <label className="text-xs font-black uppercase tracking-widest text-emerald-950/60 px-1">Prix par Gramme (DZD)</label>
                       <input type="number" step={0.01} value={pricePerGram} onChange={e => setPricePerGram(+e.target.value)} className="w-full h-16 px-8 rounded-2xl bg-white border border-emerald-950/5 text-2xl font-serif text-emerald-950 outline-none" />
                    </div>
                    <div className="space-y-3">
                       <label className="text-xs font-black uppercase tracking-widest text-emerald-950/60 px-1">Stock en Grammes</label>
                       <input type="number" value={stockGrams} onChange={e => setStockGrams(+e.target.value)} className="w-full h-16 px-8 rounded-2xl bg-white border border-emerald-950/5 text-2xl font-serif text-emerald-950 outline-none" />
                    </div>
                 </div>
              ) : (
                 <div className="space-y-8">
                    <div className="flex justify-between items-center mb-4">
                       <h3 className="font-serif text-xl text-emerald-950">Variantes {type === 'accessory' ? 'Options' : 'Taille/Couleur'}</h3>
                       <button type="button" onClick={handleAddVariant} className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-amber-600 hover:text-amber-500 transition-colors">
                          <Plus size={14} /> Ajouter une option
                       </button>
                    </div>
                    
                    <div className="space-y-4">
                       {variants.map((v, i) => (
                          <div key={v.id} className="grid grid-cols-2 md:grid-cols-6 gap-4 p-6 bg-white border border-emerald-950/5 rounded-[2rem] items-end">
                             {type !== 'accessory' && (
                               <div className="space-y-2 col-span-1">
                                  <label className="text-xs font-black uppercase tracking-widest text-emerald-950/60">Contenance ml</label>
                                  <input type="number" value={v.size_ml} onChange={e => handeUpdateVariant(v.id, { size_ml: +e.target.value })} className="w-full h-10 px-3 bg-neutral-50 rounded-lg text-xs font-bold" />
                               </div>
                             )}
                             <div className="space-y-2 col-span-1">
                                {type !== 'accessory' ? (
                                  <>
                                    <label className="text-xs font-black uppercase tracking-widest text-emerald-950/60">Teinte</label>
                                    <div className="flex gap-2">
                                       <input type="color" value={v.color} onChange={e => handeUpdateVariant(v.id, { color: e.target.value })} className="w-10 h-10 p-0 border-none bg-transparent cursor-pointer" />
                                       <input type="text" value={v.color_name} onChange={e => handeUpdateVariant(v.id, { color_name: e.target.value })} placeholder="Nom" className="w-full h-10 px-3 bg-neutral-50 rounded-lg text-xs font-bold" />
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <label className="text-xs font-black uppercase tracking-widest text-emerald-950/60">Référence / Modèle</label>
                                    <input type="text" value={v.color_name} onChange={e => handeUpdateVariant(v.id, { color_name: e.target.value })} placeholder="Ex: Grand modèle" className="w-full h-10 px-3 bg-neutral-50 rounded-lg text-xs font-bold" />
                                  </>
                                )}
                             </div>
                             {type !== 'accessory' && (
                               <div className="space-y-2 col-span-1">
                                  <label className="text-xs font-black uppercase tracking-widest text-emerald-950/60">Forme</label>
                                  <input type="text" value={v.shape} onChange={e => handeUpdateVariant(v.id, { shape: e.target.value })} className="w-full h-10 px-3 bg-neutral-50 rounded-lg text-xs font-bold" />
                               </div>
                             )}
                             <div className="space-y-2 col-span-1">
                                <label className="text-xs font-black uppercase tracking-widest text-emerald-950/60">Prix (DZD)</label>
                                <input type="number" value={v.price} onChange={e => handeUpdateVariant(v.id, { price: +e.target.value })} className="w-full h-10 px-3 bg-neutral-50 rounded-lg text-xs font-bold text-amber-600" />
                             </div>
                             <div className="space-y-2 col-span-1">
                                <label className="text-xs font-black uppercase tracking-widest text-emerald-950/60">Unités Stock</label>
                                <input type="number" value={v.stock_units} onChange={e => handeUpdateVariant(v.id, { stock_units: +e.target.value })} className="w-full h-10 px-3 bg-neutral-50 rounded-lg text-xs font-bold" />
                             </div>
                             <div className="flex justify-end p-2">
                                <button type="button" onClick={() => handleRemoveVariant(v.id)} className="text-rose-400 hover:text-rose-600 transition-colors p-2"><Trash2 size={16} /></button>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
              )}
           </section>

           <div className="pt-12 border-t border-emerald-950/5 flex gap-4">
              <button 
                type="button" 
                onClick={onClose}
                className="flex-1 h-16 rounded-2xl border border-emerald-950/5 text-emerald-950/70 text-xs font-black uppercase tracking-widest hover:bg-neutral-50 transition-colors"
              >
                Annuler
              </button>
              <button 
                type="submit" 
                disabled={isLoading}
                className="flex-[2] h-16 rounded-2xl bg-[#0a3d2e] text-white text-xs font-black uppercase tracking-widest shadow-2xl shadow-emerald-900/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                {isLoading ? <Loader2 className="animate-spin" size={16} /> : (product ? 'Enregistrer les modifications' : 'Créer la référence boutique')}
              </button>
           </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
