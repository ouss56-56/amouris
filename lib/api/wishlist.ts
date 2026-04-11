import { createClient } from '@/lib/supabase/client';

export const fetchWishlist = async () => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return [];

  const { data, error } = await supabase
    .from('wishlist')
    .select('product_id');

  if (error) {
    console.error('Error fetching wishlist:', error);
    return [];
  }

  return data.map(item => item.product_id);
};

export const toggleWishlistItem = async (productId: string) => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Check if item exists
  const { data: existing, error: checkError } = await supabase
    .from('wishlist')
    .select('id')
    .eq('customer_id', user.id)
    .eq('product_id', productId)
    .maybeSingle();

  if (checkError) throw checkError;

  if (existing) {
    // Remove
    const { error: deleteError } = await supabase
      .from('wishlist')
      .delete()
      .eq('id', existing.id);
    if (deleteError) throw deleteError;
    return false; // Removed
  } else {
    // Add
    const { error: insertError } = await supabase
      .from('wishlist')
      .insert({
        customer_id: user.id,
        product_id: productId
      });
    if (insertError) throw insertError;
    return true; // Added
  }
};
