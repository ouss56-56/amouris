import { getCategories } from '@/lib/actions/categories';
import { getBrands } from '@/lib/actions/brands';
import { getCollections } from '@/lib/actions/collections';
import { getTags } from '@/lib/actions/tags';
import { getProductById } from '@/lib/actions/products';
import { getCurrentUser } from '@/lib/actions/auth';
import ProductFormClient from '../../ProductFormClient';
import { notFound, redirect } from 'next/navigation';

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const data = await getCurrentUser();
  
  if (!data || !data.profile) {
    redirect('/login');
  }

  // Admin access check
  if (data.profile.role !== 'admin' && data.profile.role !== 'owner') {
    redirect('/account');
  }

  const [product, categories, brands, collections, tags] = await Promise.all([
    getProductById(params.id),
    getCategories(),
    getBrands(),
    getCollections(),
    getTags()
  ]);

  if (!product) {
    notFound();
  }

  return (
    <ProductFormClient 
      initialProduct={product}
      categories={categories} 
      brands={brands} 
      collections={collections} 
      tags={tags} 
    />
  );
}
