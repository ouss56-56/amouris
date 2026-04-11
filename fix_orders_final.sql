-- ============================================================
-- FINAL FIX (v2): ORDER PERSISTENCE AND ADMIN VISIBILITY
-- Run this in Supabase SQL Editor to ensure orders work correctly.
-- ============================================================

-- 1. CLONING PRE-REQUISITES (Columns)
DO $$ 
BEGIN 
    -- Add is_registered_customer if missing
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'is_registered_customer') THEN
        ALTER TABLE public.orders ADD COLUMN is_registered_customer BOOLEAN NOT NULL DEFAULT FALSE;
    END IF;

    -- Add guest_commune if missing
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'guest_commune') THEN
        ALTER TABLE public.orders ADD COLUMN guest_commune TEXT;
    END IF;

    -- Add invoice columns if missing
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'invoice_generated') THEN
        ALTER TABLE public.orders ADD COLUMN invoice_generated BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'invoice_data') THEN
        ALTER TABLE public.orders ADD COLUMN invoice_data JSONB;
    END IF;

    -- Ensure customer_id is nullable for guests
    ALTER TABLE public.orders ALTER COLUMN customer_id DROP NOT NULL;
END $$;

-- 2. ORDER NUMBER SEQUENCING
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1000;

CREATE OR REPLACE FUNCTION public.fn_generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    -- Only generate if not provided
    IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
        NEW.order_number := 'AM-' || LPAD(nextval('order_number_seq')::TEXT, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_orders_number ON public.orders;
CREATE TRIGGER trg_orders_number
    BEFORE INSERT ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.fn_generate_order_number();

-- 3. TABLE PERMISSIONS & RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

-- CLEANUP OLD POLICIES
DROP POLICY IF EXISTS "allow_insert_orders" ON public.orders;
DROP POLICY IF EXISTS "Public can create orders" ON public.orders;
DROP POLICY IF EXISTS "customer_read_own_orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
DROP POLICY IF EXISTS "select_orders_policy" ON public.orders;
DROP POLICY IF EXISTS "update_orders_policy" ON public.orders;

-- 4. NEW POLICIES

-- ALLOW INSERT (Everyone)
CREATE POLICY "allow_insert_orders"
  ON public.orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- ALLOW SELECT (Admins see all, Customers see own)
-- Updated to use 'role' column instead of 'is_admin'
CREATE POLICY "select_orders_policy"
  ON public.orders FOR SELECT
  TO authenticated
  USING (
    customer_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND (role = 'admin')
    )
  );

-- ALLOW UPDATE (Admins only)
CREATE POLICY "update_orders_policy"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND (role = 'admin')
    )
  );

-- ORDER ITEMS POLICIES
DROP POLICY IF EXISTS "allow_insert_order_items" ON public.order_items;
DROP POLICY IF EXISTS "read_order_items" ON public.order_items;
DROP POLICY IF EXISTS "select_order_items_policy" ON public.order_items;

CREATE POLICY "allow_insert_order_items"
  ON public.order_items FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "select_order_items_policy"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND (
        orders.customer_id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role = 'admin'))
      )
    )
  );

-- HISTORY POLICIES
DROP POLICY IF EXISTS "allow_insert_status_history" ON public.order_status_history;
DROP POLICY IF EXISTS "read_status_history" ON public.order_status_history;
DROP POLICY IF EXISTS "select_status_history_policy" ON public.order_status_history;

CREATE POLICY "allow_insert_status_history"
  ON public.order_status_history FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "select_status_history_policy"
  ON public.order_status_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_status_history.order_id
      AND (
        orders.customer_id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role = 'admin'))
      )
    )
  );

-- DONE!
