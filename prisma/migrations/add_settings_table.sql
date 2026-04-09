-- Migration: Create Settings Table (FINAL FIX)
-- WARNING: This completely resets your settings to defaults to fix any broken state.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop the old table completely to avoid ANY primary key or column conflicts
DROP TABLE IF EXISTS public.settings CASCADE;

-- Create the table fresh
CREATE TABLE public.settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_name_fr TEXT DEFAULT 'Amouris Parfums',
    store_name_ar TEXT DEFAULT 'أموريس للعطور',
    slogan_fr TEXT DEFAULT 'L''essence du luxe — Huiles et flacons d''exception',
    slogan_ar TEXT DEFAULT 'جوهر الفخامة — زيوت وقوارير استثنائية',
    email TEXT DEFAULT 'contact@amouris-parfums.com',
    phone TEXT DEFAULT '+213 550 00 00 00',
    address TEXT DEFAULT 'Quartier El Yasmine, Alger',
    wilaya TEXT DEFAULT 'Alger',
    instagram TEXT DEFAULT '',
    facebook TEXT DEFAULT '',
    free_delivery_threshold DECIMAL(10,2) DEFAULT 50000,
    alert_stock_perfume DECIMAL(10,2) DEFAULT 500,
    alert_stock_flacon INTEGER DEFAULT 10,
    min_order_amount DECIMAL(10,2) DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert the standard management ID
INSERT INTO public.settings (id) VALUES ('00000000-0000-0000-0000-000000000001');

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_settings_updated_at ON public.settings;
CREATE TRIGGER update_settings_updated_at 
BEFORE UPDATE ON public.settings 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
