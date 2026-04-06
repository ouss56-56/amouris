import { ShopContent } from '@/components/store/shop-content';
import { getProducts } from '@/lib/actions/products';
import { getCategories } from '@/lib/actions/categories';
import { getBrands } from '@/lib/actions/brands';

export default async function FlaconsPage() {
  const [products, categories, brands] = await Promise.all([
    getProducts({ type: 'flacon' }),
    getCategories(),
    getBrands()
  ]);

  return (
    <ShopContent 
      initialProducts={products} 
      categories={categories} 
      brands={brands} 
      initialType="flacon" 
    />
  );
}
