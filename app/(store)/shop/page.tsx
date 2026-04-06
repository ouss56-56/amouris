import { getProducts } from '@/lib/actions/products';
import { getCategories } from '@/lib/actions/categories';
import { getBrands } from '@/lib/actions/brands';
import { ShopContent } from '@/components/store/shop-content';

export default async function ShopPage() {
  const [products, categories, brands] = await Promise.all([
    getProducts({ status: 'active' } as any),
    getCategories(),
    getBrands()
  ]);

  return (
    <ShopContent 
      initialProducts={products} 
      categories={categories} 
      brands={brands} 
      initialType="all" 
    />
  );
}

