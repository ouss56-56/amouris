-- 1. Fix is_admin() function to use 'role' column
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- 2. Announcements Table Policies
-- Ensure RLS is enabled
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Allow public to see active announcements
DROP POLICY IF EXISTS "anon_read_active_announcements" ON public.announcements;
CREATE POLICY "anon_read_active_announcements"
  ON announcements FOR SELECT
  TO anon, authenticated
  USING (is_active = true OR is_admin());

-- Allow admin to do everything
DROP POLICY IF EXISTS "admin_write_announcements" ON public.announcements;
CREATE POLICY "admin_write_announcements"
  ON announcements FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- 3. Fix other admin policies that might be using is_admin()
-- Usually they are already defined, but let's make sure announcements is covered.
