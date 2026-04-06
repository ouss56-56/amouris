"use client";

import { useState, useMemo } from 'react';
import { useI18n } from '@/i18n/i18n-context';
import { ProductCard } from '@/components/store/product-card';
import { motion } from 'framer-motion';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Product, Category, Brand } from '@/lib/types';

interface ShopContentProps {
  initialProducts: Product[];
  categories: Category[];
  brands: Brand[];
  initialType?: 'all' | 'perfume' | 'flacon';
}

export function ShopContent({ initialProducts, categories, brands, initialType }: ShopContentProps) {
  const { t, language } = useI18n();
  const [selectedType, setSelectedType] = useState<'all' | 'perfume' | 'flacon'>(initialType || 'all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  
  // Filtering logic
  const filteredProducts = useMemo(() => {
    return initialProducts.filter(p => {
      if (selectedType !== 'all' && p.type !== selectedType) return false;
      if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) return false;
      if (selectedBrand !== 'all' && p.brandId !== selectedBrand) return false;
      return true;
    });
  }, [initialProducts, selectedType, selectedCategory, selectedBrand]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 shrink-0 space-y-8">
          <div>
            <h3 className="font-bold mb-4">{t('home.categories')}</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 space-x-reverse rtl:space-x-reverse">
                <Checkbox 
                  id="cat-all" 
                  checked={selectedCategory === 'all'} 
                  onCheckedChange={() => setSelectedCategory('all')} 
                />
                <Label htmlFor="cat-all" className="cursor-pointer">{t('home.view_all')}</Label>
              </div>
              {categories.map(cat => (
                <div key={cat.id} className="flex items-center gap-2">
                  <Checkbox 
                    id={cat.id} 
                    checked={selectedCategory === cat.id} 
                    onCheckedChange={() => setSelectedCategory(cat.id)} 
                  />
                  <Label htmlFor={cat.id} className="cursor-pointer">
                    {language === 'ar' ? cat.nameAR : cat.nameFR}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold mb-4">{t('nav.brands')}</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="brand-all" 
                  checked={selectedBrand === 'all'} 
                  onCheckedChange={() => setSelectedBrand('all')} 
                />
                <Label htmlFor="brand-all" className="cursor-pointer">{t('home.view_all')}</Label>
              </div>
              {brands.map(brand => (
                <div key={brand.id} className="flex items-center gap-2">
                  <Checkbox 
                    id={brand.id} 
                    checked={selectedBrand === brand.id} 
                    onCheckedChange={() => setSelectedBrand(brand.id)} 
                  />
                  <Label htmlFor={brand.id} className="cursor-pointer">
                    {language === 'ar' ? brand.nameAR : brand.nameFR}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold mb-4">{t('product.type')}</h3>
            <div className="space-y-3">
              {(['all', 'perfume', 'flacon'] as const).map(type => (
                <div key={type} className="flex items-center gap-2">
                  <Checkbox 
                    id={`type-${type}`} 
                    checked={selectedType === type} 
                    onCheckedChange={() => setSelectedType(type)} 
                  />
                  <Label htmlFor={`type-${type}`} className="cursor-pointer capitalize">
                    {type === 'all' ? t('home.view_all') : type === 'perfume' ? t('nav.perfumes') : t('nav.flacons')}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-heading font-bold">
              {selectedType === 'all' 
                ? t('nav.shop') 
                : selectedType === 'perfume' ? t('nav.perfumes') : t('nav.flacons')}
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">{filteredProducts.length} {t('product.related')}</span>
              <Select>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Trier par / ترتيب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Nouveautés (الأحدث)</SelectItem>
                  <SelectItem value="price-asc">Prix croissant (السعر من الأقل)</SelectItem>
                  <SelectItem value="price-desc">Prix décroissant (السعر من الأعلى)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <motion.div 
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.1 }
              }
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredProducts.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </motion.div>
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">
              Aucun produit trouvé. لا توجد منتجات.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

