-- ======================================================
-- AMOURIS PARFUMS — COMPREHENSIVE PRODUCT POPULATION
-- ======================================================

-- 1. ADD NEW CATEGORIES (If not exist)
INSERT INTO public.categories (id, name_fr, name_ar, slug) VALUES
('cat-11', 'Gourmet', 'حلويات', 'gourmet'),
('cat-12', 'Cuir', 'جلدي', 'cuir'),
('cat-13', 'Fruité', 'فاكهي', 'fruite')
ON CONFLICT (id) DO NOTHING;

-- 2. ADD NEW BRANDS (If not exist)
INSERT INTO public.brands (id, name, name_ar, description_fr) VALUES
('br-11', 'Amouris Private', 'أموريس بريفيه', 'Notre propre sélection d''essences d''exception pour connaisseurs.'),
('br-12', 'Essence d''Alger', 'نسيم الجزائر', 'Inspirations locales, qualité internationale.')
ON CONFLICT (id) DO NOTHING;

-- 3. ADD NEW PRODUCTS (PERFUMES)
-- We ensure they have status 'active' and descriptive data
INSERT INTO public.products (id, product_type, name_fr, name_ar, slug, description_fr, description_ar, category_id, brand_id, price_per_gram, stock_grams, status) VALUES
(
  'prf-10', 'perfume', 'Vanille de Madagascar', 'فانيليا مدغشقر', 'vanille-madagascar', 
  'Une vanille noire, grasse et sucrée, avec des notes de caramel fondu.', 
  'فانيليا سوداء، دسمة وحلوة، مع نفحات الكراميل الذائب.', 
  'cat-11', 'br-11', 850.00, 2500, 'active'
),
(
  'prf-11', 'perfume', 'Cuir Impérial', 'جلد إمبراطوري', 'cuir-imperial', 
  'Un cuir puissant et fumé, sublimé par le safran et le bouleau.', 
  'جلد قوي ومدخن، يعززه الزعفران وخشب البتولا.', 
  'cat-12', 'br-11', 1100.00, 1500, 'active'
),
(
  'prf-12', 'perfume', 'Mangue Givrée', 'مانجو مثلجة', 'mangue-givree', 
  'Une explosion de fraîcheur fruitée, mangue mûre et menthe sauvage.', 
  'انفجار من الانتعاش الفاكهي، مانجو ناضجة ونعناع بري.', 
  'cat-13', 'br-12', 720.00, 4000, 'active'
),
(
  'prf-13', 'perfume', 'Musc Blanc Royal', 'مسك أبيض ملكي', 'musc-blanc-royal', 
  'La pureté absolue du musc blanc, doux comme un nuage.', 
  'نقاء المسك الأبيض المطلق، ناعم كالسحاب.', 
  'cat-06', 'br-12', 550.00, 8000, 'active'
)
ON CONFLICT (id) DO NOTHING;

-- 4. LINK PRODUCTS TO TAGS (Ensure they appear on homepage)
-- tag-01: Arrivage, tag-02: Best-seller, tag-08: Nouveauté
INSERT INTO public.product_tags (product_id, tag_id) VALUES
('prf-10', 'tag-08'), -- Vanille is a New Arrival
('prf-10', 'tag-02'), -- and a Best-seller
('prf-11', 'tag-01'), -- Cuir is a New Arrival
('prf-12', 'tag-08'), -- Mangue is a New Arrival
('prf-13', 'tag-02')  -- Musc is a Best-seller
ON CONFLICT (product_id, tag_id) DO NOTHING;

-- 5. ADD NEW PRODUCTS (BOTTLES / FLACONS)
INSERT INTO public.products (id, product_type, name_fr, name_ar, slug, description_fr, description_ar, category_id, base_price, status) VALUES
(
  'flc-05', 'flacon', 'Flacon Cristal d''Or', 'قارورة كريستال ذهبية', 'flacon-cristal-d-or', 
  'Flacon en cristal soufflé avec finitions à l''or fin 24 carats.', 
  'قارورة من الكريستال المنفوخ مع لمسات من الذهب الخالص عيار 24 قيراطًا.', 
  'cat-01', 2500.00, 'active'
),
(
  'flc-06', 'flacon', 'Vaporisateur Voyage', 'بخاخ السفر', 'vaporisateur-voyage', 
  'Atomiseur de sac en aluminium brossé, pratique et élégant.', 
  'بخاخ حقيبة من الألومنيوم المصقول، عملي وأنيق.', 
  'cat-01', 450.00, 'active'
)
ON CONFLICT (id) DO NOTHING;

-- 6. ADD VARIANTS FOR NEW FLACONS
INSERT INTO public.flacon_variants (id, product_id, size_ml, color, color_name, shape, price, stock_units) VALUES
('fv-010', 'flc-05', 50, '#FFD700', 'Or Royal', 'Cristal', 2500.00, 20),
('fv-011', 'flc-05', 100, '#FFD700', 'Or Royal', 'Cristal', 4500.00, 10),
('fv-012', 'flc-06', 10, '#C0C0C0', 'Argent', 'Cylindre', 450.00, 100),
('fv-013', 'flc-06', 10, '#000000', 'Noir Mat', 'Cylindre', 550.00, 50),
('fv-014', 'flc-06', 10, '#B87333', 'Cuivre', 'Cylindre', 450.00, 30)
ON CONFLICT (id) DO NOTHING;

-- 7. TAG BOTTLES FOR HOMEPAGE
INSERT INTO public.product_tags (product_id, tag_id) VALUES
('flc-05', 'tag-03'), -- Premium
('flc-06', 'tag-01')  -- New Arrival
ON CONFLICT (product_id, tag_id) DO NOTHING;
