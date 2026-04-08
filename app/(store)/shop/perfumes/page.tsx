import { ShopContent } from '@/components/store/shop-content';
import { getProducts } from '@/lib/actions/products';
import { getCategories } from '@/lib/actions/categories';
import { getBrands } from '@/lib/actions/brands';
import { Suspense } from 'react';
import ShopLoading from '../loading';

export default async function PerfumesPage() {
  const [products, categories, brands] = await Promise.all([
    getProducts({ type: 'perfume', status: 'active' }),
    getCategories(),
    getBrands()
  ]);

  return (
    <Suspense fallback={<ShopLoading />}>
      <ShopContent 
        initialProducts={products} 
        categories={categories} 
        brands={brands} 
        initialType="perfume" 
      />
    </Suspense>
  );
}
