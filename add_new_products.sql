-- ══════════════════════════════════════════════════
-- NEW PRODUCTS AND CATEGORIES FOR AMOURIS PARFUMS
-- ══════════════════════════════════════════════════

-- 1. ADD NEW CATEGORIES
INSERT INTO public.categories (id, name_fr, name_ar, slug) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Gourmet', 'حلويات', 'gourmet'),
  ('b2c3d4e5-f6a7-8901-bcde-f0123456789a', 'Cuir', 'جلدي', 'cuir'),
  ('c3d4e5f6-a7b8-9012-cdef-0123456789ab', 'Fruité', 'فاكهي', 'fruite')
ON CONFLICT (slug) DO NOTHING;

-- 2. ADD NEW PRODUCTS (PERFUMES)
-- Note: Using existing IDs for Brand (Al Haramain, Amouage, Lattafa) 
-- and Collections (Royale, Nuit de Sahara, Été Arabe) from seed data.

INSERT INTO public.products (
  product_type, name_fr, name_ar, slug, description_fr, description_ar, 
  category_id, brand_id, collection_id, price_per_gram, stock_grams, status
) VALUES
  (
    'perfume', 'Vanille Suprême', 'فانيلا سوبريم', 'vanille-supreme', 
    'Une essence gourmande de vanille de Madagascar.', 'خلاصة فانيليا مدغشقر اللذيذة.', 
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 
    '49c711b6-2650-4eb0-aa32-7ddc1cfa62b9', -- Al Haramain
    '0cf0895b-a6df-4fd4-a272-d7c9961f497f', -- Collection Royale
    950.00, 2000.00, 'active'
  ),
  (
    'perfume', 'Cuir d''Orient', 'جلد شرقي', 'cuir-d-orient', 
    'Un cuir fumé aux accents de safran et de oud.', 'جلد مدخن بلمسات الزعفران والعود.', 
    'b2c3d4e5-f6a7-8901-bcde-f0123456789a', 
    '09cd82bc-4a20-42a5-ab90-786fd9c62973', -- Amouage
    'e410cbd6-613a-4c51-9661-882cbb8a7dbd', -- Nuit de Sahara
    1100.00, 1500.00, 'active'
  ),
  (
    'perfume', 'Mangue Dorée', 'مانجو ذهبية', 'mangue-doree', 
    'Une explosion fruitée de mangue mûre et de musc blanc.', 'انفجار فاكهي من المانجو الناضجة والمسك الأبيض.', 
    'c3d4e5f6-a7b8-9012-cdef-0123456789ab', 
    '986c761e-f546-4665-9435-7a7f6481cbc6', -- Lattafa
    '403ab04e-27fd-4c46-a2fe-eb06097742f9', -- Été Arabe
    750.00, 3000.00, 'active'
  )
ON CONFLICT (slug) DO NOTHING;

-- 3. ADD NEW PRODUCTS (FLACONS)
INSERT INTO public.products (
  product_type, name_fr, name_ar, slug, description_fr, description_ar, 
  category_id, base_price, status
) VALUES
  (
    'flacon', 'Flacon Cristal d''Or', 'قارورة كريستال ذهبية', 'flacon-cristal-d-or', 
    'Flacon en cristal avec finitions à l''or fin.', 'قارورة كريستال بلمسات من الذهب الخالص.', 
    '7ad58d98-7a95-424f-8e74-2ccaae3c79dd', -- Linked to existing 'Oud' category for bottles if needed
    2500.00, 'active'
  ),
  (
    'flacon', 'Flacon Ambre Royal', 'قارورة عنبر ملكية', 'flacon-ambre-royal', 
    'Verre ambré profond avec bouchon sculpté.', 'زجاج عنبري عميق بسدادة منحوتة.', 
    '82b9b38a-a17c-4ab8-8e83-9dee47efbf77', -- Linked to 'Ambré' category
    1800.00, 'active'
  )
ON CONFLICT (slug) DO NOTHING;

-- 4. ADD VARIANTS FOR NEW FLACONS
-- First, get the product IDs (handled as subqueries for safety)
DO $$
DECLARE
    prod_id_1 UUID;
    prod_id_2 UUID;
BEGIN
    SELECT id INTO prod_id_1 FROM public.products WHERE slug = 'flacon-cristal-d-or';
    SELECT id INTO prod_id_2 FROM public.products WHERE slug = 'flacon-ambre-royal';

    IF prod_id_1 IS NOT NULL THEN
        INSERT INTO public.flacon_variants (product_id, size_ml, color, shape, price, stock_units)
        VALUES (prod_id_1, 50, 'Gold', 'Crystal', 2500.00, 50);
    END IF;

    IF prod_id_2 IS NOT NULL THEN
        INSERT INTO public.flacon_variants (product_id, size_ml, color, shape, price, stock_units)
        VALUES (prod_id_2, 100, 'Amber', 'Royal', 1800.00, 30);
    END IF;
END $$;
