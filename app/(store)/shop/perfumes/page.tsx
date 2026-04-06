import { ShopContent } from '@/components/store/shop-content';
import { getProducts } from '@/lib/actions/products';
import { getCategories } from '@/lib/actions/categories';
import { getBrands } from '@/lib/actions/brands';

export default async function PerfumesPage() {
  const [products, categories, brands] = await Promise.all([
    getProducts({ type: 'perfume' }),
    getCategories(),
    getBrands()
  ]);

  return (
    <ShopContent 
      initialProducts={products} 
      categories={categories} 
      brands={brands} 
      initialType="perfume" 
    />
  );
}
