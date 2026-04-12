-- Fix database IDs and columns for Amouris

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Announcements
ALTER TABLE public.announcements 
  ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- 3. Products
ALTER TABLE public.products 
  ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- 4. Categories
ALTER TABLE public.categories 
  ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- 5. Brands
ALTER TABLE public.brands 
  ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- 6. Collections - Ensure cover_image column exists and id has default
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='collections' AND column_name='cover_image') THEN
        ALTER TABLE public.collections ADD COLUMN cover_image TEXT;
    END IF;
END $$;

ALTER TABLE public.collections 
  ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- 7. Tags
ALTER TABLE public.tags 
  ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- 8. Flacon Variants
ALTER TABLE public.flacon_variants 
  ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- 9. Refresh Schema Cache (by creating/dropping a dummy table)
-- Supabase automatically refreshes metadata after DDL changes usually, 
-- but this is a common trick to force a PostgREST refresh.
CREATE TABLE IF NOT EXISTS public.schema_refresh_dummy (id int);
DROP TABLE public.schema_refresh_dummy;
