import { getProductBySlug } from '@/lib/actions/products';
import { getBrands } from '@/lib/actions/brands';
import { getCategories } from '@/lib/actions/categories';
import ProductClient from './ProductClient';
import { notFound } from 'next/navigation';

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  
  if (!product) {
    notFound();
  }

  // We could also fetch brands/categories to find the specific ones if mapping is not enough
  const [brands, categories] = await Promise.all([
    getBrands(),
    getCategories()
  ]);

  const brand = brands.find(b => b.id === product.brandId);
  const category = categories.find(c => c.id === product.categoryId);

  return (
    <ProductClient 
      product={product} 
      brand={brand} 
      category={category} 
    />
  );
}

