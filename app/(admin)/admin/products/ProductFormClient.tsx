"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/i18n/i18n-context';
import { Product, Category, Brand, Collection, Tag, ProductType, FlaconVariant } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Upload, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { createProduct, updateProduct } from '@/lib/actions/products';

interface ProductFormClientProps {
  initialProduct?: Product;
  categories: Category[];
  brands: Brand[];
  collections: Collection[];
  tags: Tag[];
}

export default function ProductFormClient({
  initialProduct,
  categories,
  brands,
  collections,
  tags
}: ProductFormClientProps) {
  const router = useRouter();
  const { language } = useI18n();
  const isEditing = !!initialProduct;
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<Partial<Product>>(initialProduct || {
    type: 'perfume',
    nameAR: '',
    nameFR: '',
    descriptionAR: '',
    descriptionFR: '',
    categoryId: '',
    brandId: '',
    collectionId: '',
    tagIds: [],
    images: [],
    status: 'active',
  });

  // Specific fields for perfumes
  const [perfumeData, setPerfumeData] = useState({
    pricePerGram: (initialProduct as any)?.pricePerGram || 0,
    stockInGrams: (initialProduct as any)?.stockInGrams || 0,
  });

  // Specific fields for flacons
  const [variants, setVariants] = useState<Partial<FlaconVariant>[]>(
    (initialProduct as any)?.variants || []
  );

  const handleAddVariant = () => {
    setVariants([...variants, { id: Math.random().toString(), size: '', color: '', shape: '', price: 0, stock: 0 }]);
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const finalData = {
        ...formData,
        ...(formData.type === 'perfume' ? perfumeData : { variants }),
      };

      if (isEditing && initialProduct) {
        await updateProduct(initialProduct.id, finalData as Product);
        toast.success(language === 'ar' ? 'تم تحديث المنتج' : 'Produit mis à jour');
      } else {
        await createProduct(finalData as Product);
        toast.success(language === 'ar' ? 'تم إنشاء المنتج' : 'Produit créé');
      }
      router.push('/admin/products');
      router.refresh();
    } catch (error: any) {
      toast.error('Error: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTag = (tagId: string) => {
    const currentTags = formData.tagIds || [];
    if (currentTags.includes(tagId)) {
      setFormData({ ...formData, tagIds: currentTags.filter(id => id !== tagId) });
    } else {
      setFormData({ ...formData, tagIds: [...currentTags, tagId] });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto pb-20">
      <div className="flex justify-between items-center bg-background/80 backdrop-blur-sm sticky top-0 z-20 py-4 border-b">
        <h1 className="text-3xl font-heading font-bold">
          {isEditing 
            ? (language === 'ar' ? 'تعديل منتج' : 'Modifier le produit') 
            : (language === 'ar' ? 'إضافة منتج جديد' : 'Nouveau produit')}
        </h1>
        <div className="flex gap-4">
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            {language === 'ar' ? 'إلغاء' : 'Annuler'}
          </Button>
          <Button type="submit" className="gap-2" disabled={isLoading}>
            <Save className="w-4 h-4" />
            {isLoading ? '...' : (language === 'ar' ? 'حفظ' : 'Enregistrer')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Basic Info */}
          <Card>
            <CardHeader><CardTitle>{language === 'ar' ? 'المعلومات الأساسية' : 'Informations de base'}</CardTitle></CardHeader>
            <CardContent className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'الاسم (عربي)' : 'Nom (Arabe)'}</Label>
                    <Input 
                      value={formData.nameAR} 
                      onChange={e => setFormData({ ...formData, nameAR: e.target.value })} 
                      dir="rtl" 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'الاسم (فرنسي)' : 'Nom (Français)'}</Label>
                    <Input 
                      value={formData.nameFR} 
                      onChange={e => setFormData({ ...formData, nameFR: e.target.value })} 
                      required 
                    />
                  </div>
               </div>

               <div className="space-y-2">
                  <Label>{language === 'ar' ? 'الوصف (عربي)' : 'Description (Arabe)'}</Label>
                  <Textarea 
                    value={formData.descriptionAR} 
                    onChange={e => setFormData({ ...formData, descriptionAR: e.target.value })} 
                    dir="rtl" 
                    rows={4} 
                  />
               </div>
               <div className="space-y-2">
                  <Label>{language === 'ar' ? 'الوصف (فرنسي)' : 'Description (Français)'}</Label>
                  <Textarea 
                    value={formData.descriptionFR} 
                    onChange={e => setFormData({ ...formData, descriptionFR: e.target.value })} 
                    rows={4} 
                  />
               </div>
            </CardContent>
          </Card>

          {/* Pricing & Stock */}
          <Card>
             <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{language === 'ar' ? 'السعر والمخزون' : 'Prix & Stock'}</CardTitle>
                <div className="flex gap-2">
                   <Button 
                      type="button" 
                      variant={formData.type === 'perfume' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFormData({ ...formData, type: 'perfume' })}
                   >
                      {language === 'ar' ? 'عطر' : 'Parfum'}
                   </Button>
                   <Button 
                      type="button" 
                      variant={formData.type === 'flacon' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFormData({ ...formData, type: 'flacon' })}
                   >
                      {language === 'ar' ? 'قارورة' : 'Flacon'}
                   </Button>
                </div>
             </CardHeader>
             <CardContent>
                {formData.type === 'perfume' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'السعر لكل غرام' : 'Prix par gramme (DZD)'}</Label>
                      <Input 
                        type="number" 
                        value={perfumeData.pricePerGram} 
                        onChange={e => setPerfumeData({ ...perfumeData, pricePerGram: parseFloat(e.target.value) })} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'المخزون (غرام)' : 'Stock (Grams)'}</Label>
                      <Input 
                        type="number" 
                        value={perfumeData.stockInGrams} 
                        onChange={e => setPerfumeData({ ...perfumeData, stockInGrams: parseFloat(e.target.value) })} 
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {variants.map((v, idx) => (
                      <div key={idx} className="flex flex-wrap gap-4 items-end p-4 border rounded-lg bg-secondary/10">
                        <div className="flex-1 min-w-[100px] space-y-2">
                          <Label className="text-xs">Size (ml)</Label>
                          <Input value={v.size} onChange={e => {
                            const newVars = [...variants];
                            newVars[idx].size = e.target.value;
                            setVariants(newVars);
                          }} placeholder="30ml" />
                        </div>
                        <div className="flex-1 min-w-[100px] space-y-2">
                          <Label className="text-xs">Color</Label>
                          <Input value={v.color} onChange={e => {
                            const newVars = [...variants];
                            newVars[idx].color = e.target.value;
                            setVariants(newVars);
                          }} placeholder="Gold" />
                        </div>
                        <div className="flex-1 min-w-[80px] space-y-2">
                          <Label className="text-xs">Price (DZD)</Label>
                          <Input type="number" value={v.price} onChange={e => {
                            const newVars = [...variants];
                            newVars[idx].price = parseFloat(e.target.value);
                            setVariants(newVars);
                          }} />
                        </div>
                        <div className="flex-1 min-w-[80px] space-y-2">
                          <Label className="text-xs">Stock</Label>
                          <Input type="number" value={v.stock} onChange={e => {
                            const newVars = [...variants];
                            newVars[idx].stock = parseInt(e.target.value);
                            setVariants(newVars);
                          }} />
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveVariant(idx)} className="text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button type="button" variant="outline" className="w-full gap-2 border-dashed" onClick={handleAddVariant}>
                      <Plus className="w-4 h-4" />
                      {language === 'ar' ? 'إضافة خيار' : 'Ajouter une variante'}
                    </Button>
                  </div>
                )}
             </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          {/* Organization */}
          <Card>
            <CardHeader><CardTitle>{language === 'ar' ? 'التنظيم' : 'Organisation'}</CardTitle></CardHeader>
            <CardContent className="space-y-6">
               <div className="space-y-2">
                  <Label>{language === 'ar' ? 'التصنيف' : 'Catégorie'}</Label>
                  <Select value={formData.categoryId} onValueChange={v => setFormData({ ...formData, categoryId: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {categories.map(c => (
                        <SelectItem key={c.id} value={c.id}>{language === 'ar' ? c.nameAR : c.nameFR}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
               </div>

               <div className="space-y-2">
                  <Label>{language === 'ar' ? 'الماركة' : 'Marque'}</Label>
                  <Select value={formData.brandId} onValueChange={v => setFormData({ ...formData, brandId: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {brands.map(b => (
                        <SelectItem key={b.id} value={b.id}>{language === 'ar' ? b.nameAR : b.nameFR}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
               </div>

               <div className="space-y-2">
                  <Label>{language === 'ar' ? 'المجموعة' : 'Collection'}</Label>
                  <Select value={formData.collectionId} onValueChange={v => setFormData({ ...formData, collectionId: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Aucune</SelectItem>
                      {collections.map(col => (
                        <SelectItem key={col.id} value={col.id}>{language === 'ar' ? col.nameAR : col.nameFR}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
               </div>

               <div className="space-y-4">
                  <Label>{language === 'ar' ? 'الوسوم' : 'Tags'}</Label>
                  <div className="flex flex-wrap gap-2">
                     {tags.map(tag => (
                       <Badge 
                         key={tag.id} 
                         variant={formData.tagIds?.includes(tag.id) ? 'default' : 'outline'}
                         className="cursor-pointer"
                         onClick={() => toggleTag(tag.id)}
                       >
                         {language === 'ar' ? tag.nameAR : tag.nameFR}
                       </Badge>
                     ))}
                  </div>
               </div>
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader><CardTitle>{language === 'ar' ? 'الحالة' : 'Statut'}</CardTitle></CardHeader>
            <CardContent>
               <Select value={formData.status} onValueChange={(v: any) => setFormData({ ...formData, status: v })}>
                 <SelectTrigger><SelectValue /></SelectTrigger>
                 <SelectContent>
                   <SelectItem value="active">Active</SelectItem>
                   <SelectItem value="draft">Draft</SelectItem>
                 </SelectContent>
               </Select>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
