-- 1. Fix missing description columns for Categories
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS description_fr TEXT,
ADD COLUMN IF NOT EXISTS description_ar TEXT;

-- 2. Ensure Collections has descriptions (in case the previous schema was not fully applied)
ALTER TABLE public.collections 
ADD COLUMN IF NOT EXISTS description_fr TEXT,
ADD COLUMN IF NOT EXISTS description_ar TEXT;

-- 3. Fix is_admin function to match the profiles schema (is_admin BOOLEAN vs role = 'admin')
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND is_admin = true
  );
$$;
