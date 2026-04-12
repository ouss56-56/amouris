-- ==========================================
-- AMOURIS STORAGE SETUP
-- ==========================================

-- 1. Create Buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('brands', 'brands', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('collections', 'collections', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Clear existing policies to avoid conflicts
-- (Optional: only if you want a clean slate)
-- DROP POLICY IF EXISTS "public_read_product_images" ON storage.objects;
-- DROP POLICY IF EXISTS "admin_upload_product_images" ON storage.objects;
-- DROP POLICY IF EXISTS "admin_delete_product_images" ON storage.objects;

-- 3. PRODUCTS BUCKET POLICIES

-- Read: Everyone
CREATE POLICY "public_read_product_images"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'products');

-- Insert: Admins only
CREATE POLICY "admin_upload_product_images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'products'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Delete: Admins only
CREATE POLICY "admin_delete_product_images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'products'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 4. BRANDS BUCKET POLICIES

-- Read: Everyone
CREATE POLICY "public_read_brand_images"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'brands');

-- Insert: Admins only
CREATE POLICY "admin_upload_brand_images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'brands'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Delete: Admins only
CREATE POLICY "admin_delete_brand_images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'brands'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 5. COLLECTIONS BUCKET POLICIES

-- Read: Everyone
CREATE POLICY "public_read_collection_images"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'collections');

-- Insert: Admins only
CREATE POLICY "admin_upload_collection_images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'collections'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Delete: Admins only
CREATE POLICY "admin_delete_collection_images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'collections'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
