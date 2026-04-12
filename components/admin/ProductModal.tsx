"use client";

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { createClient } from '@/lib/supabase/client';
import { addProduct as apiAddProduct, updateProduct as apiUpdateProduct } from '@/lib/api/products';
import { 
  Upload, X, Plus, Trash2, Loader2, Sparkles, 
  Box, Droplets, Pipette, Eye, EyeOff, 
  AlertCircle, ChevronRight, Info,
  Tag as TagIcon, LayoutGrid, Ruler,
  Palette, Shapes, Layers
} from 'lucide-react';
import { uploadImage } from '@/lib/actions/storage';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [activeTab, setActiveTab] = useState<'details' | 'taxonomy' | 'inventory' | 'media'>('details');
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
        const buffer = await file.arrayBuffer();
        const publicUrl = await uploadImage({
          name: file.name,
          type: file.type,
          buffer: buffer
        }, 'products');

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
      <DialogContent className="max-w-[1200px] w-[95vw] max-h-[95vh] overflow-hidden bg-[#FBFBFB] rounded-[3rem] p-0 border-none shadow-[0_0_100px_rgba(0,0,0,0.2)] font-sans">
        <div className="flex h-full flex-col md:flex-row">
           {/* Sidebar - Visual Header Style */}
           <div className="md:w-1/3 bg-[#0a3d2e] p-12 text-white relative flex flex-col justify-between overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                 <div className="absolute -top-20 -left-20 w-80 h-80 bg-emerald-400 rounded-full blur-[100px]" />
                 <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-amber-400 rounded-full blur-[100px]" />
              </div>

              <div className="relative z-10 space-y-8">
                 <div className="w-20 h-20 bg-white/10 rounded-[2rem] flex items-center justify-center backdrop-blur-md border border-white/10 shadow-inner">
                    {type === 'perfume' ? <Droplets size={32} className="text-emerald-400" /> : type === 'flacon' ? <Box size={32} className="text-amber-400" /> : <Pipette size={32} className="text-rose-400" />}
                 </div>
                 
                 <div className="space-y-4">
                    <DialogHeader>
                      <DialogTitle className="font-serif text-5xl leading-tight font-bold italic">
                        {product ? 'Modification Boutique' : 'Nouvelle Référence'}
                      </DialogTitle>
                    </DialogHeader>
                    <p className="text-emerald-100/40 text-[10px] font-black uppercase tracking-[0.5em] leading-relaxed">
                       Saisissez les détails de vos essences et articles de luxe pour le catalogue maître Amouris.
                    </p>
                 </div>

                 <div className="pt-12 space-y-4">
                    {[
                      { id: 'details', label: 'Détails de l\'Essence', icon: Info, color: 'text-[#C9A84C]' },
                      { id: 'taxonomy', label: 'Taxonomie', icon: LayoutGrid, color: 'text-white' },
                      { id: 'inventory', label: 'Inventaire', icon: Ruler, color: 'text-white' },
                      { id: 'media', label: 'Médias', icon: Layers, color: 'text-white' }
                    ].map((tab) => (
                      <button 
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`w-full flex items-center gap-4 group transition-all p-3 rounded-2xl ${activeTab === tab.id ? 'bg-white/10 border border-white/10' : 'opacity-50 hover:opacity-100'}`}
                      >
                         <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-[#C9A84C]/20 transition-all`}>
                            <tab.icon size={18} className={activeTab === tab.id ? tab.color : 'text-white'} />
                         </div>
                         <p className="text-[11px] font-bold text-emerald-50/60 uppercase tracking-widest">{tab.label}</p>
                      </button>
                    ))}
                 </div>
              </div>

              <div className="relative z-10 p-8 rounded-3xl bg-amber-50 border border-amber-100 shadow-sm">
                 <p className="text-[10px] font-black uppercase tracking-widest text-amber-800 mb-2 flex items-center gap-2">
                    <Sparkles size={12} className="text-amber-500" /> Conseil Amouris
                 </p>
                 <p className="text-xs text-amber-900/70 italic leading-relaxed">
                    Privilégiez des photos haute résolution sur fond neutre pour sublimer vos produits.
                 </p>
              </div>
           </div>

           {/* Main Form Area */}
           <div className="flex-1 overflow-y-auto max-h-[95vh] no-scrollbar">
              <form onSubmit={handleSubmit} className="p-12 space-y-16">
                 {/* Type & Status Switchers */}
                 <section className="flex flex-wrap items-center justify-between gap-8">
                    <div className="space-y-4">
                       <label className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-950/30 px-2 block">Classification Catalogue</label>
                       <div className="flex p-2 bg-neutral-100 rounded-2xl w-fit">
                          {[
                             { id: 'perfume', label: 'Parfum', Icon: Droplets },
                             { id: 'flacon', label: 'Flacon', Icon: Box },
                             { id: 'accessory', label: 'Accessoire', Icon: Pipette }
                          ].map((t) => (
                             <button 
                                key={t.id}
                                type="button" 
                                onClick={() => setType(t.id as any)}
                                className={`px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all duration-500 ${type === t.id ? 'bg-[#0a3d2e] text-white shadow-xl shadow-emerald-950/20' : 'text-emerald-950/40 hover:text-emerald-950 hover:bg-white/50'}`}
                             >
                                <t.Icon size={16} /> {t.label}
                             </button>
                          ))}
                       </div>
                    </div>

                    <div className="space-y-4">
                       <label className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-950/30 px-2 block text-right">Visibilité</label>
                       <div className="flex p-2 bg-neutral-100 rounded-2xl w-fit shadow-inner">
                          {[
                             { id: 'active', label: 'Publié', Icon: Eye, color: 'bg-emerald-600' },
                             { id: 'draft', label: 'Brouillon', Icon: EyeOff, color: 'bg-amber-600' }
                          ].map((s) => (
                             <button 
                                key={s.id}
                                type="button" 
                                onClick={() => setFormData({ ...formData, status: s.id })}
                                className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-3 transition-all duration-500 ${formData.status === s.id ? `${s.color} text-white shadow-lg` : 'text-emerald-950/40 hover:text-emerald-950'}`}
                             >
                                <s.Icon size={14} /> {s.label}
                             </button>
                          ))}
                       </div>
                    </div>
                 </section>

                 {activeTab === 'details' && (
                    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      {/* Identity */}
                      <section className="space-y-10">
                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            <div className="space-y-4">
                               <label className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-950/30 px-2 block font-serif">Nom de la Création (FR)</label>
                               <input 
                                 required 
                                 placeholder="Ex: Nuit Nomade"
                                 value={formData.name_fr} 
                                 onChange={e => setFormData({ ...formData, name_fr: e.target.value })} 
                                 className="w-full h-20 px-8 rounded-3xl bg-white border border-emerald-950/5 focus:border-[#C9A84C] outline-none font-serif text-2xl text-emerald-950 shadow-sm transition-all focus:ring-4 focus:ring-emerald-900/5 placeholder:opacity-20" 
                               />
                            </div>
                            <div className="space-y-4">
                               <label className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-950/30 px-2 block font-serif text-right">الاسم بالعربية</label>
                               <input 
                                 required 
                                 placeholder="اسم المنتج"
                                 value={formData.name_ar} 
                                 onChange={e => setFormData({ ...formData, name_ar: e.target.value })} 
                                 dir="rtl" 
                                 className="w-full h-20 px-8 rounded-3xl bg-white border border-emerald-950/5 focus:border-[#C9A84C] outline-none font-arabic text-3xl text-emerald-950 shadow-sm transition-all focus:ring-4 focus:ring-emerald-900/5 text-right placeholder:opacity-20" 
                               />
                            </div>
                         </div>

                         <div className="space-y-4">
                            <label className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-950/30 px-2 block">Identifiant Unique (Permalien)</label>
                            <div className="relative">
                               <div className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-950/20 font-mono text-xs">amouris.com/p/</div>
                               <input 
                                 value={slug} 
                                 onChange={e => setSlug(e.target.value)} 
                                 className="w-full h-14 pl-32 pr-8 rounded-2xl bg-neutral-100/50 border border-emerald-950/5 focus:border-[#C9A84C] outline-none font-mono text-xs text-emerald-800 transition-all font-bold" 
                               />
                            </div>
                         </div>
                      </section>

                      {/* Descriptions */}
                      <section className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                         <div className="space-y-4">
                            <label className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-950/30 px-2 block">Histoire Olfactive (FR)</label>
                            <textarea 
                               value={formData.description_fr} 
                               onChange={e => setFormData({ ...formData, description_fr: e.target.value })} 
                               rows={4} 
                               placeholder="Décrivez les notes de tête, de cœur et de fond..."
                               className="w-full p-8 rounded-[2.5rem] bg-white border border-emerald-950/5 focus:border-[#C9A84C] outline-none text-base text-emerald-950/70 shadow-sm transition-all resize-none leading-relaxed placeholder:italic" 
                            />
                         </div>
                         <div className="space-y-4 text-right">
                            <label className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-950/30 px-2 block">الوصف بالتفصيل (AR)</label>
                            <textarea 
                               value={formData.description_ar} 
                               onChange={e => setFormData({ ...formData, description_ar: e.target.value })} 
                               rows={4} 
                               dir="rtl"
                               placeholder="اكتب وصفاً جذاباً للمنتج..."
                               className="w-full p-8 rounded-[2.5rem] bg-white border border-emerald-950/5 focus:border-[#C9A84C] outline-none font-arabic text-xl text-emerald-950/70 shadow-sm transition-all resize-none leading-relaxed text-right placeholder:italic" 
                            />
                         </div>
                      </section>
                    </div>
                  )}

                  {activeTab === 'taxonomy' && (
                    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      {/* Taxonomy & Properties */}
                      <section className="p-12 bg-neutral-100/40 rounded-[3rem] border border-emerald-950/5 space-y-12">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-6">
                               <label className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.3em] text-emerald-950/30 px-2">
                                  <Layers size={14} className="text-[#C9A84C]" /> Catégorisation
                               </label>
                               <select 
                                 value={formData.category_id} 
                                 onChange={e => setFormData({ ...formData, category_id: e.target.value })} 
                                 className="w-full h-16 px-6 rounded-2xl bg-white border border-emerald-950/10 focus:border-[#C9A84C] shadow-sm text-sm font-bold text-emerald-950 outline-none"
                               >
                                  <option value="">Sélectionner une catégorie</option>
                                  {categories.map(c => <option key={c.id} value={c.id}>{c.name_fr}</option>)}
                               </select>
                            </div>
                            <div className="space-y-6">
                               <label className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.3em] text-emerald-950/30 px-2">
                                  <Palette size={14} className="text-[#C9A84C]" /> Maison de Parfum
                               </label>
                               <select 
                                 value={formData.brand_id || ''} 
                                 onChange={e => setFormData({ ...formData, brand_id: e.target.value })} 
                                 className="w-full h-16 px-6 rounded-2xl bg-white border border-emerald-950/10 focus:border-[#C9A84C] shadow-sm text-sm font-bold text-emerald-950 outline-none"
                               >
                                  <option value="">Toutes marques confondues</option>
                                  {brands.map(b => <option key={b.id} value={b.id}>{b.name || b.name_fr}</option>)}
                               </select>
                            </div>
                         </div>

                         <div className="space-y-6">
                            <label className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.3em] text-emerald-950/30 px-2">
                               <TagIcon size={14} className="text-[#C9A84C]" /> Attributs & Caractéristiques
                            </label>
                            <div className="flex flex-wrap gap-3">
                               {tags.map(t => {
                                  const isActive = formData.tag_ids?.includes(t.id);
                                  return (
                                     <button 
                                        key={t.id} 
                                        type="button" 
                                        onClick={() => toggleTag(t.id)}
                                        className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border transition-all duration-500 ${isActive ? 'bg-[#C9A84C] border-[#C9A84C] text-emerald-950 shadow-lg shadow-[#C9A84C]/20' : 'bg-white border-emerald-950/5 text-emerald-900/40 hover:text-emerald-950 hover:bg-white'}`}
                                     >
                                        {t.name_fr}
                                     </button>
                                  );
                               })}
                            </div>
                         </div>
                      </section>
                    </div>
                  )}

                  {activeTab === 'inventory' && (
                    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      {/* Price & Inventory */}
                      <section className="space-y-8">
                         {type === 'perfume' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 p-12 bg-emerald-950 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                               <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/5 rounded-full blur-3xl -mr-20 -mt-20" />
                               <div className="space-y-4">
                                  <label className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.3em] text-emerald-400 px-2">
                                     <Palette size={14} /> Valeur (DZD/g)
                                  </label>
                                  <div className="relative">
                                     <input 
                                        type="number" 
                                        step={0.01} 
                                        value={pricePerGram} 
                                        onChange={e => setPricePerGram(+e.target.value)} 
                                        className="w-full h-24 px-8 rounded-3xl bg-white/5 border border-white/10 text-5xl font-serif text-[#C9A84C] outline-none focus:bg-white/10 transition-all font-bold" 
                                     />
                                     <div className="absolute right-8 top-1/2 -translate-y-1/2 text-2xl font-serif text-white/20">DZD</div>
                                  </div>
                               </div>
                               <div className="space-y-4">
                                  <label className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.3em] text-emerald-400 px-2">
                                     <Ruler size={14} /> Réserve Stock (g)
                                  </label>
                                  <input 
                                     type="number" 
                                     value={stockGrams} 
                                     onChange={e => setStockGrams(+e.target.value)} 
                                     className="w-full h-24 px-8 rounded-3xl bg-white/5 border border-white/10 text-5xl font-serif text-emerald-50 outline-none focus:bg-white/10 transition-all font-bold" 
                                  />
                               </div>
                            </div>
                         ) : (
                            <div className="space-y-8">
                               <header className="flex justify-between items-end px-2">
                                  <div className="space-y-1">
                                     <h3 className="font-serif text-3xl text-emerald-950 font-bold italic tracking-tight">Variantes de Collection</h3>
                                     <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-950/30">Gérez les contenances et styles</p>
                                  </div>
                                  <button type="button" onClick={handleAddVariant} className="h-12 px-6 bg-[#C9A84C] text-emerald-950 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#C9A84C]/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                                     <Plus size={16} /> Ajouter une option
                                  </button>
                               </header>
                               
                               <div className="space-y-4">
                                  <AnimatePresence mode="popLayout">
                                     {variants.map((v) => (
                                        <motion.div 
                                           key={v.id} 
                                           initial={{ opacity: 0, x: -20 }}
                                           animate={{ opacity: 1, x: 0 }}
                                           exit={{ opacity: 0, x: 20 }}
                                           className="grid grid-cols-2 md:grid-cols-6 gap-6 p-8 bg-white border border-emerald-950/5 rounded-[2rem] items-end shadow-sm hover:shadow-md transition-shadow relative group/variant"
                                        >
                                           {type !== 'accessory' && (
                                             <div className="space-y-3 col-span-1">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-emerald-950/30">ML</label>
                                                <input type="number" value={v.size_ml} onChange={e => handeUpdateVariant(v.id, { size_ml: +e.target.value })} className="w-full h-12 px-4 bg-neutral-50 rounded-xl text-xs font-bold border border-transparent focus:border-[#C9A84C] outline-none" />
                                             </div>
                                           )}
                                           <div className="space-y-3 col-span-1">
                                              <label className="text-[9px] font-black uppercase tracking-widest text-emerald-950/30">{type === 'accessory' ? 'Style' : 'Couleur'}</label>
                                              <div className="flex gap-2">
                                                 {type !== 'accessory' && (
                                                   <input type="color" value={v.color} onChange={e => handeUpdateVariant(v.id, { color: e.target.value })} className="w-12 h-12 p-1 bg-white border border-emerald-950/10 rounded-xl cursor-pointer" />
                                                 )}
                                                 <input type="text" value={v.color_name} onChange={e => handeUpdateVariant(v.id, { color_name: e.target.value })} placeholder="Label" className="w-full h-12 px-4 bg-neutral-50 rounded-xl text-xs font-bold border border-transparent focus:border-[#C9A84C] outline-none" />
                                              </div>
                                           </div>
                                           {type !== 'accessory' && (
                                             <div className="space-y-3 col-span-1">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-emerald-950/30">Forme</label>
                                                <input type="text" value={v.shape} onChange={e => handeUpdateVariant(v.id, { shape: e.target.value })} placeholder="Cœur, Carré..." className="w-full h-12 px-4 bg-neutral-50 rounded-xl text-xs font-bold border border-transparent focus:border-[#C9A84C] outline-none" />
                                             </div>
                                           )}
                                           <div className="space-y-3 col-span-1">
                                              <label className="text-[9px] font-black uppercase tracking-widest text-emerald-950/30">Tarif HT</label>
                                              <input type="number" value={v.price} onChange={e => handeUpdateVariant(v.id, { price: +e.target.value })} className="w-full h-12 px-4 bg-white border-2 border-emerald-950/5 rounded-xl text-sm font-black text-amber-600 outline-none focus:border-[#C9A84C]" />
                                           </div>
                                           <div className="space-y-3 col-span-1">
                                              <label className="text-[9px] font-black uppercase tracking-widest text-emerald-950/30">Unités</label>
                                              <input type="number" value={v.stock_units} onChange={e => handeUpdateVariant(v.id, { stock_units: +e.target.value })} className="w-full h-12 px-4 bg-neutral-50 rounded-xl text-xs font-bold border border-transparent focus:border-[#C9A84C] outline-none" />
                                           </div>
                                           <div className="flex justify-end p-2 opacity-0 group-hover/variant:opacity-100 transition-opacity">
                                              <button type="button" onClick={() => handleRemoveVariant(v.id)} className="w-10 h-10 rounded-xl bg-rose-50 text-rose-400 hover:text-rose-600 hover:bg-rose-100 transition-all flex items-center justify-center shadow-sm"><Trash2 size={16} /></button>
                                           </div>
                                        </motion.div>
                                     ))}
                                  </AnimatePresence>
                               </div>
                            </div>
                         )}
                      </section>
                    </div>
                  )}

                  {activeTab === 'media' && (
                    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      {/* Visuals */}
                      <section className="space-y-6">
                         <div className="flex items-center justify-between px-2">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-emerald-950/40">Portfolio Visuel</h3>
                            <span className="text-[10px] font-bold text-[#C9A84C]">{formData.images?.length || 0} / 3 Images</span>
                         </div>
                         
                         <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            <AnimatePresence mode="popLayout">
                               {formData.images?.map((img: string, idx: number) => (
                                  <motion.div 
                                     key={idx}
                                     initial={{ opacity: 0, scale: 0.8 }}
                                     animate={{ opacity: 1, scale: 1 }}
                                     exit={{ opacity: 0, scale: 0.8 }}
                                     className="relative aspect-[4/5] rounded-3xl overflow-hidden border border-emerald-950/5 group/img shadow-sm"
                                  >
                                     <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                                     <div className="absolute inset-0 bg-emerald-950/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                        <button 
                                           type="button"
                                           onClick={() => setFormData({ ...formData, images: formData.images?.filter((_: any, i: number) => i !== idx) })}
                                           className="w-12 h-12 bg-rose-500 text-white rounded-2xl flex items-center justify-center hover:scale-110 transition-transform shadow-xl"
                                        >
                                           <Trash2 size={20} />
                                        </button>
                                     </div>
                                  </motion.div>
                               ))}
                            </AnimatePresence>
                            
                            {(formData.images?.length || 0) < 3 && (
                               <button 
                                 type="button"
                                 disabled={isUploading}
                                 onClick={() => fileInputRef.current?.click()}
                                 className="aspect-[4/5] rounded-3xl border-2 border-dashed border-emerald-950/10 flex flex-col items-center justify-center gap-4 bg-neutral-100/30 hover:bg-white hover:border-[#C9A84C]/40 transition-all group disabled:opacity-50"
                               >
                                  <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-emerald-950/20 group-hover:text-[#C9A84C] shadow-sm transition-all group-hover:shadow-lg group-hover:scale-110">
                                     {isUploading ? <Loader2 className="animate-spin" size={24} /> : <Plus size={24} />}
                                  </div>
                                  <div className="text-center">
                                     <p className="text-[10px] font-black uppercase tracking-widest text-emerald-950/30 group-hover:text-emerald-950 transition-colors">Ajouter</p>
                                     <p className="text-[8px] font-bold text-emerald-950/20 uppercase mt-1">PNG, JPG (Max 5Mo)</p>
                                  </div>
                                  <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                               </button>
                            )}
                         </div>
                      </section>
                    </div>
                  )}

                 <footer className="pt-12 border-t border-emerald-950/5 flex flex-col md:flex-row gap-6">
                    <button 
                      type="button" 
                      onClick={onClose}
                      className="flex-1 h-20 rounded-[1.5rem] border border-emerald-950/5 text-emerald-950/30 text-[11px] font-black uppercase tracking-[0.3em] hover:bg-neutral-50 hover:text-emerald-950 transition-all"
                    >
                      Annuler l &apos; Opération
                    </button>
                    <button 
                      type="submit" 
                      disabled={isLoading}
                      className="flex-[2] h-20 rounded-[1.5rem] bg-[#0a3d2e] text-white text-[11px] font-black uppercase tracking-[0.3em] shadow-[0_20px_40px_rgba(10,61,46,0.2)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 group"
                    >
                      {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
                         <>
                           <span className="group-hover:translate-x-[-4px] transition-transform">{product ? 'Valider les modifications' : 'Inscrire au Catalogue'}</span>
                           <ChevronRight size={18} className="text-emerald-400 group-hover:translate-x-[4px] transition-transform" />
                         </>
                      )}
                    </button>
                 </footer>
              </form>
           </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
