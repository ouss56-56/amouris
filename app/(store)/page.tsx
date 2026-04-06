import { getProducts } from '@/lib/actions/products';
import { getCategories } from '@/lib/actions/categories';
import { getBrands } from '@/lib/actions/brands';
import { getActiveAnnouncements } from '@/lib/actions/announcements';
import HomeClient from './HomeClient';

export default async function HomePage() {
  const [products, categories, brands, announcements] = await Promise.all([
    getProducts({ limit: 8 } as any),
    getCategories(),
    getBrands(),
    getActiveAnnouncements()
  ]);

  return (
    <HomeClient 
      products={products} 
      categories={categories} 
      brands={brands} 
      announcements={announcements} 
    />
  );
}

