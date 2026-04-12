-- ══════════════════════════════════════════════════════════════════════════
-- CATALOGUE REAL-TIME & INTEGRATION PATCH
-- ══════════════════════════════════════════════════════════════════════════

-- 1. Create Catalogues Table (for PDF/Documents)
CREATE TABLE IF NOT EXISTS public.catalogues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL UNIQUE CHECK (type IN ('parfums', 'flacons')),
    filename TEXT NOT NULL,
    url TEXT NOT NULL,
    file_size_kb INTEGER,
    uploaded_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Add Updated_at triggers if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_catalogues_updated_at') THEN
        CREATE TRIGGER update_catalogues_updated_at 
        BEFORE UPDATE ON public.catalogues 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- 3. Ensure Products table has correct columns and types
-- Check if images is TEXT[]
-- (Skip if already correct, but good to have as reference)

-- 4. Storage Bucket for Catalogues
-- This is usually done via RPC or dashboard, but let's ensure public read
INSERT INTO storage.buckets (id, name, public) 
VALUES ('catalogues', 'catalogues', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 5. RLS Policies for Catalogues Table
ALTER TABLE public.catalogues ENABLE ROW LEVEL SECURITY;

-- Public can read
DROP POLICY IF EXISTS "Public Read Catalogues" ON public.catalogues;
CREATE POLICY "Public Read Catalogues" ON public.catalogues FOR SELECT USING (true);

-- Authenticated can do everything (Admin)
DROP POLICY IF EXISTS "Admin Full Access Catalogues" ON public.catalogues;
CREATE POLICY "Admin Full Access Catalogues" ON public.catalogues FOR ALL TO authenticated USING (true);

-- 6. Storage Policies for 'catalogues' bucket
DROP POLICY IF EXISTS "Public Read Storage Catalogues" ON storage.objects;
CREATE POLICY "Public Read Storage Catalogues" ON storage.objects FOR SELECT USING (bucket_id = 'catalogues');

DROP POLICY IF EXISTS "Admin Upload Storage Catalogues" ON storage.objects;
CREATE POLICY "Admin Upload Storage Catalogues" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'catalogues');

DROP POLICY IF EXISTS "Admin Delete Storage Catalogues" ON storage.objects;
CREATE POLICY "Admin Delete Storage Catalogues" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'catalogues');
