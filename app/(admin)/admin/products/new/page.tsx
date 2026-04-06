import { getCategories } from '@/lib/actions/categories';
import { getBrands } from '@/lib/actions/brands';
import { getCollections } from '@/lib/actions/collections';
import { getTags } from '@/lib/actions/tags';
import { getCurrentUser } from '@/lib/actions/auth';
import ProductFormClient from '../ProductFormClient';
import { redirect } from 'next/navigation';

export default async function NewProductPage() {
  const data = await getCurrentUser();
  
  if (!data || !data.profile) {
    redirect('/login');
  }

  // Admin access check
  if (data.profile.role !== 'admin' && data.profile.role !== 'owner') {
    redirect('/account');
  }

  const [categories, brands, collections, tags] = await Promise.all([
    getCategories(),
    getBrands(),
    getCollections(),
    getTags()
  ]);

  return (
    <ProductFormClient 
      categories={categories} 
      brands={brands} 
      collections={collections} 
      tags={tags} 
    />
  );
}
