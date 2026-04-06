"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useI18n } from '@/i18n/i18n-context';
import { Product, Category, Brand } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AdminProductsClientProps {
  products: Product[];
  categories: Category[];
  brands: Brand[];
}

export default function AdminProductsClient({ products, categories, brands }: AdminProductsClientProps) {
  const { language } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filteredProducts = products.filter(p => {
    const nameStr = (p.nameAR + ' ' + p.nameFR).toLowerCase();
    const matchesSearch = nameStr.includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || p.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-heading font-bold text-foreground">
          {language === 'ar' ? 'المنتجات' : 'Produits'}
        </h1>
        <Link href="/admin/products/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            {language === 'ar' ? 'إضافة منتج' : 'Ajouter un produit'}
          </Button>
        </Link>
      </div>

      <div className="bg-card border rounded-xl shadow-sm">
        <div className="p-4 border-b flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground rtl:right-3 rtl:left-auto" />
            <Input 
              placeholder={language === 'ar' ? 'بحث عن منتج...' : 'Rechercher un produit...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 rtl:pr-9 rtl:pl-3"
            />
          </div>
          
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{language === 'ar' ? 'الكل' : 'Tous'}</SelectItem>
              <SelectItem value="perfume">{language === 'ar' ? 'عطر زيتي' : 'Parfum'}</SelectItem>
              <SelectItem value="flacon">{language === 'ar' ? 'قارورة' : 'Flacon'}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left rtl:text-right">
            <thead className="text-xs text-muted-foreground bg-secondary/30 uppercase border-b">
              <tr>
                <th className="px-6 py-4">Produit</th>
                <th className="px-6 py-4">Catégorie / Marque</th>
                <th className="px-6 py-4">Prix</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => {
                const category = categories.find(c => c.id === product.categoryId);
                const brand = brands.find(b => b.id === product.brandId);
                
                return (
                  <tr key={product.id} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md overflow-hidden relative shrink-0 border bg-secondary/20">
                          {product.images?.[0] ? (
                            <Image src={product.images[0]} alt="" fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">?</div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold">{language === 'ar' ? product.nameAR : product.nameFR}</p>
                          <p className="text-xs text-muted-foreground">
                            {product.type === 'perfume' ? 'Huile de parfum' : 'Flacon'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium">{language === 'ar' ? category?.nameAR : category?.nameFR}</p>
                      <p className="text-xs text-muted-foreground">{language === 'ar' ? brand?.nameAR : brand?.nameFR || '-'}</p>
                    </td>
                    <td className="px-6 py-4 font-bold">
                      {product.type === 'perfume' ? `${product.pricePerGram} DZD/g` : `${product.variants?.[0]?.price || 'N/A'} DZD`}
                    </td>
                    <td className="px-6 py-4">
                      {product.type === 'perfume' ? (
                        <Badge variant={product.stockInGrams < 1000 ? "destructive" : "secondary"}>
                          {product.stockInGrams}g
                        </Badge>
                      ) : (
                        <div className="text-xs space-y-1">
                          {product.variants?.map(v => (
                            <div key={v.id} className="flex justify-between gap-2">
                               <span className="text-muted-foreground">{v.size}:</span>
                               <span className={v.stock < 100 ? "text-destructive font-bold" : ""}>{v.stock}</span>
                            </div>
                          )) || 'No variants'}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={product.status === 'active' ? "default" : "secondary"} className={product.status === 'active' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}>
                        {product.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/products/edit/${product.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive border-transparent">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    Aucun produit ne correspond à votre recherche.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
