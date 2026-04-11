import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { fetchWishlistProducts } from '@/lib/api/products';
import FavoritesClient from './FavoritesClient';

export default async function FavoritesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch wishlist item IDs first
  const { data: wishlistItems } = await supabase
    .from('wishlist')
    .select('product_id')
    .eq('customer_id', user.id);

  const productIds = wishlistItems?.map(item => item.product_id) || [];
  
  // Fetch actual product details
  const products = productIds.length > 0 
    ? await fetchWishlistProducts(productIds)
    : [];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-serif text-3xl md:text-4xl text-emerald-950 italic font-bold">
          Mes Favoris
        </h1>
        <p className="text-gray-500 font-medium">
          Retrouvez ici tous les produits que vous avez aimés.
        </p>
      </header>

      <FavoritesClient initialProducts={products} />
    </div>
  );
}
