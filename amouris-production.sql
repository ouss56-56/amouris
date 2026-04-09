-- ==========================================
-- AMOURIS PARFUMS — PRODUCTION SQL SCRIPT
-- Generated: 2026-04-10
-- ==========================================

-- === SECTION 1: EXTENSIONS ===
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- === SECTION 2: CLEANUP ===
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.increment_product_stock(text, numeric) CASCADE;
DROP FUNCTION IF EXISTS public.increment_variant_stock(text, integer) CASCADE;

DROP TABLE IF EXISTS public.order_history CASCADE;
DROP TABLE IF EXISTS public.order_status_history CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.flacon_variants CASCADE;
DROP TABLE IF EXISTS public.product_tags CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.tags CASCADE;
DROP TABLE IF EXISTS public.collections CASCADE;
DROP TABLE IF EXISTS public.brands CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.settings CASCADE;
DROP TABLE IF EXISTS public.announcements CASCADE;
DROP TABLE IF EXISTS public.catalogues CASCADE;

DROP SEQUENCE IF EXISTS order_number_seq;
DROP SEQUENCE IF EXISTS invoice_number_seq;

-- === SECTION 3: SEQUENCES ===
CREATE SEQUENCE order_number_seq START 1000;
CREATE SEQUENCE invoice_number_seq START 100;

-- === SECTION 4: TABLES ===

-- Table: profiles (Extends auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    shop_name TEXT,
    wilaya TEXT NOT NULL,
    commune TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
    is_frozen BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: settings (Store configuration)
CREATE TABLE public.settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_fr TEXT DEFAULT 'Amouris Parfums',
    name_ar TEXT DEFAULT 'أموريس للعطور',
    slogan_fr TEXT,
    slogan_ar TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    wilaya TEXT,
    instagram TEXT,
    facebook TEXT,
    free_shipping_threshold NUMERIC(10, 2) DEFAULT 50000,
    stock_alert_grams NUMERIC(10, 2) DEFAULT 500,
    stock_alert_units INTEGER DEFAULT 10,
    min_order_amount NUMERIC(10, 2) DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: categories
CREATE TABLE public.categories (
    id TEXT PRIMARY KEY,
    name_fr TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: brands
CREATE TABLE public.brands (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    logo_url TEXT,
    description_fr TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: collections
CREATE TABLE public.collections (
    id TEXT PRIMARY KEY,
    name_fr TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    description_fr TEXT,
    cover_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: tags
CREATE TABLE public.tags (
    id TEXT PRIMARY KEY,
    name_fr TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    show_on_homepage BOOLEAN DEFAULT FALSE,
    homepage_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: products
CREATE TABLE public.products (
    id TEXT PRIMARY KEY,
    product_type TEXT NOT NULL CHECK (product_type IN ('perfume', 'flacon')),
    name_fr TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description_fr TEXT,
    description_ar TEXT,
    category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
    brand_id TEXT REFERENCES public.brands(id) ON DELETE SET NULL,
    collection_id TEXT REFERENCES public.collections(id) ON DELETE SET NULL,
    price_per_gram NUMERIC(10, 2), -- Only for perfume
    stock_grams NUMERIC(10, 2),    -- Only for perfume
    base_price NUMERIC(10, 2),     -- Reference price
    images TEXT[] DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: product_tags (M2M)
CREATE TABLE public.product_tags (
    product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
    tag_id TEXT REFERENCES public.tags(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, tag_id)
);

-- Table: flacon_variants
CREATE TABLE public.flacon_variants (
    id TEXT PRIMARY KEY,
    product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
    size_ml INTEGER NOT NULL,
    color TEXT,
    color_name TEXT,
    shape TEXT,
    price NUMERIC(10, 2) NOT NULL,
    stock_units INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: orders
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    is_registered_customer BOOLEAN NOT NULL DEFAULT FALSE,
    guest_first_name TEXT,
    guest_last_name TEXT,
    guest_phone TEXT,
    guest_wilaya TEXT,
    guest_commune TEXT,
    total_amount NUMERIC(10, 2) NOT NULL,
    amount_paid NUMERIC(10, 2) DEFAULT 0,
    payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid')),
    order_status TEXT NOT NULL DEFAULT 'pending' CHECK (order_status IN ('pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled')),
    admin_notes TEXT,
    invoice_generated BOOLEAN DEFAULT FALSE,
    invoice_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: order_items
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
    product_type TEXT NOT NULL,
    flacon_variant_id TEXT REFERENCES public.flacon_variants(id) ON DELETE SET NULL,
    product_name_fr TEXT NOT NULL,
    product_name_ar TEXT NOT NULL,
    variant_label TEXT,
    quantity_grams NUMERIC(10, 2),
    quantity_units INTEGER,
    unit_price NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL
);

-- Table: order_history
CREATE TABLE public.order_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: announcements
CREATE TABLE public.announcements (
    id TEXT PRIMARY KEY,
    text_fr TEXT NOT NULL,
    text_ar TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- === SECTION 5: INDEXES ===
CREATE INDEX idx_products_slug ON public.products(slug);
CREATE INDEX idx_products_status ON public.products(status);
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_orders_customer ON public.orders(customer_id);
CREATE INDEX idx_orders_status ON public.orders(order_status);
CREATE INDEX idx_orders_created ON public.orders(created_at);
CREATE INDEX idx_profiles_phone ON public.profiles(phone);
CREATE INDEX idx_flacon_variants_product ON public.flacon_variants(product_id);

-- === SECTION 6: FUNCTIONS ===

-- Function: Check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'admin'
    FROM public.profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    first_name, 
    last_name, 
    phone, 
    shop_name,
    wilaya, 
    commune,
    role
  )
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'first_name', ''),
    COALESCE(new.raw_user_meta_data->>'last_name', ''),
    COALESCE(new.raw_user_meta_data->>'phone', ''),
    COALESCE(new.raw_user_meta_data->>'shop_name', NULL),
    COALESCE(new.raw_user_meta_data->>'wilaya', 'Alger'),
    COALESCE(new.raw_user_meta_data->>'commune', NULL),
    COALESCE(new.raw_user_meta_data->>'role', 'customer')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Increment stock RPC
CREATE OR REPLACE FUNCTION public.increment_product_stock(p_id TEXT, delta NUMERIC)
RETURNS VOID AS $$
BEGIN
  UPDATE public.products
  SET stock_grams = GREATEST(0, stock_grams + delta)
  WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Increment variant stock RPC
CREATE OR REPLACE FUNCTION public.increment_variant_stock(v_id TEXT, delta INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE public.flacon_variants
  SET stock_units = GREATEST(0, stock_units + delta)
  WHERE id = v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- === SECTION 7: TRIGGERS ===

-- Trigger: Auth user to profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function: update_updated_at_column
CREATE OR REPLACE FUNCTION public.fn_update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Update updated_at for orders
CREATE TRIGGER trg_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.fn_update_updated_at_column();

-- Function: Generate Order Number
CREATE OR REPLACE FUNCTION public.fn_generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL THEN
        NEW.order_number := 'AM-' || LPAD(nextval('order_number_seq')::TEXT, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_orders_number
    BEFORE INSERT ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.fn_generate_order_number();

-- === SECTION 8: ROW LEVEL SECURITY ===

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flacon_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Policies: Profiles
CREATE POLICY "Public profiles are viewable by admin" ON public.profiles FOR SELECT USING (is_admin());
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Policies: Settings
CREATE POLICY "Public can view settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage settings" ON public.settings FOR ALL TO authenticated USING (is_admin());

-- Policies: Catalogues (Categories, Brands, etc.)
CREATE POLICY "Public can view catalogue" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public can view brands" ON public.brands FOR SELECT USING (true);
CREATE POLICY "Public can view collections" ON public.collections FOR SELECT USING (true);
CREATE POLICY "Public can view tags" ON public.tags FOR SELECT USING (true);
CREATE POLICY "Public can view products" ON public.products FOR SELECT USING (status = 'active');
CREATE POLICY "Admins can view ALL products" ON public.products FOR SELECT USING (is_admin());
CREATE POLICY "Public can view variants" ON public.flacon_variants FOR SELECT USING (true);

-- Admin management for catalogue
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (is_admin());
CREATE POLICY "Admins can manage brands" ON public.brands FOR ALL USING (is_admin());
CREATE POLICY "Admins can manage collections" ON public.collections FOR ALL USING (is_admin());
CREATE POLICY "Admins can manage tags" ON public.tags FOR ALL USING (is_admin());
CREATE POLICY "Admins can manage products" ON public.products FOR ALL USING (is_admin());
CREATE POLICY "Admins can manage variants" ON public.flacon_variants FOR ALL USING (is_admin());
CREATE POLICY "Admins can manage product_tags" ON public.product_tags FOR ALL USING (is_admin());

-- Policies: Orders
CREATE POLICY "Public can create orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Admins can view all orders" ON public.orders FOR SELECT USING (is_admin());
CREATE POLICY "Admins can update orders" ON public.orders FOR UPDATE USING (is_admin());

CREATE POLICY "Public can insert order items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all order items" ON public.order_items FOR SELECT USING (is_admin());
CREATE POLICY "Users can view their own order items" ON public.order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND customer_id = auth.uid())
);

-- === SECTION 9: REALTIME ===
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_history;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- === SECTION 10: STORAGE ===

-- Note: Buckets must be created via Dashboard or API.
-- These are the policies for the expected buckets.

-- Bucket: 'products'
-- Bucket: 'brands'
-- Bucket: 'collections'
-- Bucket: 'catalogues'

-- Policy for public read access
-- CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id IN ('products', 'brands', 'collections', 'catalogues'));

-- Policy for admin uploads
-- CREATE POLICY "Admin Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id IN ('products', 'brands', 'collections', 'catalogues') AND public.is_admin());

-- === SECTION 11: INITIAL DATA ===

-- Insert Settings
INSERT INTO public.settings (name_fr, name_ar, slogan_fr, slogan_ar, email, phone, address, wilaya)
VALUES (
    'Amouris Parfums', 'أموريس للعطور',
    'L''essence du luxe — Huiles et flacons d''exception', 'جوهر الفخامة — زيوت وقوارير استثنائية',
    'contact@amouris-parfums.com', '+213 550 00 00 00',
    'Quartier El Yasmine, Alger', 'Alger'
);

-- Insert Categories
INSERT INTO public.categories (id, name_fr, name_ar, slug) VALUES
('cat-01', 'Oud', 'عود', 'oud'),
('cat-02', 'Floral', 'زهري', 'floral'),
('cat-03', 'Oriental', 'شرقي', 'oriental'),
('cat-04', 'Frais', 'منعش', 'frais'),
('cat-05', 'Boisé', 'خشبي', 'boise'),
('cat-06', 'Musqué', 'مسكي', 'musque'),
('cat-07', 'Épicé', 'بهاري', 'epice'),
('cat-08', 'Citrus', 'حمضي', 'citrus'),
('cat-09', 'Aquatique', 'مائي', 'aquatique'),
('cat-10', 'Ambré', 'عنبري', 'ambre');

-- Insert Brands
INSERT INTO public.brands (id, name, name_ar, description_fr) VALUES
('br-01', 'Al Haramain', 'الحرمين', 'Maison de parfumerie orientale fondée à La Mecque.'),
('br-02', 'Amouage', 'عمواج', 'La marque de luxe du Sultanat d''Oman.'),
('br-03', 'Lattafa', 'لطافة', 'Parfums arabes premium accessibles.'),
('br-04', 'Maison Tahara', 'ميزون طهارة', 'Élégance française et âme orientale.'),
('br-05', 'Rasasi', 'رصاصي', 'Parfumerie de Dubaï depuis 1979.'),
('br-06', 'Swiss Arabian', 'سويس عربيان', 'La rencontre de l''Orient et de l''Occident.'),
('br-07', 'Ajmal', 'أجمل', 'Une des plus anciennes maisons de parfumerie du Golfe.'),
('br-08', 'Armaf', 'أرماف', 'Parfums de luxe à prix accessible.'),
('br-09', 'Oud Milano', 'عود ميلانو', 'Fusion Orient-Italie, qualité premium.'),
('br-10', 'Paris Corner', 'باريس كورنر', 'Inspirations haute couture françaises.');

-- Insert Collections
INSERT INTO public.collections (id, name_fr, name_ar, description_fr) VALUES
('col-01', 'Collection Royale', 'المجموعة الملكية', 'Les essences les plus précieuses, dignes des rois.'),
('col-02', 'Été Arabe', 'الصيف العربي', 'Légèreté et fraîcheur pour l''été.'),
('col-03', 'Nuit de Sahara', 'ليلة الصحراء', 'Profondeur et mystère du désert.'),
('col-04', 'Prestige', 'بريستيج', 'Notre sélection premium.'),
('col-05', 'Bakhoor Heritage', 'تراث البخور', 'L''art ancestral du bakhoor.'),
('col-06', 'Oud Signature', 'توقيع العود', 'La quintessence de l''oud.'),
('col-07', 'Fleurs d''Orient', 'أزهار الشرق', 'Les fleurs rares de la péninsule arabique.'),
('col-08', 'Masculin Intense', 'رجولي مكثف', 'Compositions intenses pour homme.'),
('col-09', 'Féminité Dorée', 'أنوثة ذهبية', 'Douceur, fleur et musc pour elle.'),
('col-10', 'Zen & Méditation', 'زن وتأمل', 'Sérénité et notes apaisantes.');

-- Insert Tags
INSERT INTO public.tags (id, name_fr, name_ar, slug, show_on_homepage, homepage_order) VALUES
('tag-01', 'Arrivage', 'وصل جديد', 'arrivage', true, 1),
('tag-02', 'Best-seller', 'الأكثر مبيعاً', 'best-seller', true, 2),
('tag-03', 'Premium', 'مميز', 'premium', true, 3),
('tag-04', 'Offre spéciale', 'عرض خاص', 'offre-speciale', false, 4),
('tag-05', 'Exclusif', 'حصري', 'exclusif', false, 5),
('tag-06', 'Saisonnier', 'موسمي', 'saisonnier', false, 6),
('tag-07', 'Coup de cœur', 'المفضل', 'coup-de-coeur', false, 7),
('tag-08', 'Nouveauté', 'جديد', 'nouveaute', false, 8),
('tag-09', 'Limité', 'محدود', 'limite', false, 9),
('tag-10', 'Professionnel', 'مهني', 'professionnel', false, 10);

-- Insert Products (Parfums)
INSERT INTO public.products (id, product_type, name_fr, name_ar, slug, description_fr, description_ar, category_id, brand_id, collection_id, price_per_gram, stock_grams, images, status) VALUES
('prf-01', 'perfume', 'Rose du Taif', 'وردة الطائف', 'rose-du-taif', 'Une huile de parfum envoûtante aux notes de rose de Taïf, oud blanc et musc rare.', 'زيت عطري فاتن بنفحات وردة الطائف والعود الأبيض والمسك النادر.', 'cat-02', 'br-01', 'col-07', 850, 5000, ARRAY['/images/products/rose-du-taif.png'], 'active'),
('prf-02', 'perfume', 'Oud Malaki', 'عود ملكي', 'oud-malaki', 'L''oud royal dans toute sa splendeur. Profond, chaleureux, impérial.', 'العود الملكي في كامل روعته. عميق، دافئ، فاخر.', 'cat-01', 'br-02', 'col-01', 1200, 3000, ARRAY['/images/products/oud-malaki.png'], 'active'),
('prf-03', 'perfume', 'Jasmin Sauvage', 'ياسمين بري', 'jasmin-sauvage', 'Jasmin blanc intense capturé à l''aurore. Frais, floral, addictif.', 'ياسمين أبيض مكثف يُقطف عند الفجر. منعش، زهري، مُدمِن.', 'cat-02', 'br-04', 'col-02', 650, 4500, ARRAY['/images/products/jasmin-sauvage.png'], 'active'),
('prf-04', 'perfume', 'Ambre Noir', 'عنبر أسود', 'ambre-noir', 'Un ambre mystérieux aux accords de bois précieux et vanille noire.', 'عنبر غامض بمزيج الأخشاب النفيسة والفانيلا السوداء.', 'cat-10', 'br-05', 'col-03', 950, 2500, ARRAY['/images/products/ambre-noir.png'], 'active'),
('prf-05', 'perfume', 'Musc Tahara', 'مسك طهارة', 'musc-tahara', 'Musc blanc pur, délicat et soyeux. Une pureté absolue.', 'مسك أبيض نقي، رقيق وحريري. نقاء مطلق.', 'cat-06', 'br-04', 'col-04', 500, 6000, ARRAY['/images/products/musc-tahara.png'], 'active');

-- Insert Product Tags
INSERT INTO public.product_tags (product_id, tag_id) VALUES
('prf-01', 'tag-01'), ('prf-01', 'tag-02'),
('prf-02', 'tag-02'), ('prf-02', 'tag-03'),
('prf-03', 'tag-01'),
('prf-04', 'tag-03'),
('prf-05', 'tag-01'), ('prf-05', 'tag-02');

-- Insert Flacons
INSERT INTO public.products (id, product_type, name_fr, name_ar, slug, description_fr, description_ar, category_id, base_price, status) VALUES
('flc-01', 'flacon', 'Flacon Classique Transparent', 'قارورة كلاسيكية شفافة', 'flacon-classique', 'Flacon en verre épais, bouchon doré. Design intemporel.', 'قارورة زجاج سميك، سدادة ذهبية. تصميم خالد وأنيق.', 'cat-01', 350, 'active'),
('flc-02', 'flacon', 'Flacon Luxe Noir Atomiseur', 'قارورة فخمة سوداء بخاخ', 'flacon-noir-atomiseur', 'Verre teinté noir mat avec atomiseur doré. L''élégance absolue.', 'زجاج ملون بالأسود المات مع بخاخ ذهبي. الأناقة المطلقة.', 'cat-01', 550, 'active');

-- Insert Flacon Variants
INSERT INTO public.flacon_variants (id, product_id, size_ml, color, color_name, shape, price, stock_units) VALUES
('fv-001', 'flc-01', 30, '#F8F8FF', 'Transparent', 'Carré', 350, 200),
('fv-002', 'flc-01', 50, '#F8F8FF', 'Transparent', 'Carré', 450, 150),
('fv-003', 'flc-01', 100, '#F8F8FF', 'Transparent', 'Carré', 600, 100),
('fv-004', 'flc-02', 30, '#1A1A1A', 'Noir Mat', 'Rond', 550, 80),
('fv-005', 'flc-02', 50, '#1A1A1A', 'Noir Mat', 'Rond', 750, 60);

-- Insert Announcements
INSERT INTO public.announcements (id, text_fr, text_ar, is_active, display_order) VALUES
('ann-01', 'Livraison gratuite pour les commandes de plus de 50 000 DZD', 'توصيل مجاني للطلبات فوق 50,000 دج', true, 1),
('ann-02', 'Nouveaux arrivages de flacons de luxe disponibles', 'وصلت قوارير فاخرة جديدة', true, 2),
('ann-03', 'Paiement à la livraison dans toutes les 58 wilayas', 'الدفع عند الاستلام في جميع الولايات الـ58', true, 3);

-- === SECTION 12: ADMIN ACCOUNT ===

-- NOTE : Ce bloc est un rappel des étapes manuelles
-- L'admin doit être créé via le Dashboard Supabase Authentication
-- puis son rôle mis à jour avec :

/*
UPDATE public.profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users
    WHERE email = 'admin@gmail.com' -- Remplacer par l'email réel
);
*/
