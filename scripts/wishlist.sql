-- ══════════════════════════════════════════════════
-- WISHLIST (FAVORITES) TABLE
-- ══════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.wishlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(customer_id, product_id)
);

-- Enable RLS
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Customers can manage their own wishlist" ON public.wishlist;
CREATE POLICY "Customers can manage their own wishlist" 
    ON public.wishlist 
    FOR ALL
    TO authenticated
    USING (auth.uid() = customer_id)
    WITH CHECK (auth.uid() = customer_id);

-- Explicit insert policy for authenticated users
DROP POLICY IF EXISTS "allow_insert_wishlist" ON public.wishlist;
CREATE POLICY "allow_insert_wishlist"
    ON public.wishlist
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = customer_id);

-- Explicit select policy
DROP POLICY IF EXISTS "allow_select_wishlist" ON public.wishlist;
CREATE POLICY "allow_select_wishlist"
    ON public.wishlist
    FOR SELECT
    TO authenticated
    USING (auth.uid() = customer_id);

-- Explicit delete policy
DROP POLICY IF EXISTS "allow_delete_wishlist" ON public.wishlist;
CREATE POLICY "allow_delete_wishlist"
    ON public.wishlist
    FOR DELETE
    TO authenticated
    USING (auth.uid() = customer_id);
