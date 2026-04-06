import { getProducts } from '@/lib/actions/products';
import { getCategories } from '@/lib/actions/categories';
import { getBrands } from '@/lib/actions/brands';
import { getCurrentUser } from '@/lib/actions/auth';
import AdminProductsClient from './AdminProductsClient';
import { redirect } from 'next/navigation';

export default async function AdminProductsPage() {
  const data = await getCurrentUser();
  
  if (!data || !data.profile) {
    redirect('/login');
  }

  // Admin access check
  if (data.profile.role !== 'admin' && data.profile.role !== 'owner') {
    redirect('/account');
  }

  const [products, categories, brands] = await Promise.all([
    getProducts({}), // Fetch all
    getCategories(),
    getBrands()
  ]);

  return (
    <AdminProductsClient 
      products={products} 
      categories={categories} 
      brands={brands} 
    />
  );
}

