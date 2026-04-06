-- TABLE: profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'owner')),
  first_name TEXT,
  last_name TEXT,
  shop_name TEXT,
  phone TEXT UNIQUE,
  wilaya TEXT,
  commune TEXT,
  is_frozen BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- TABLE: categories
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name_ar TEXT NOT NULL,
  name_fr TEXT NOT NULL,
  slug TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- TABLE: brands
CREATE TABLE IF NOT EXISTS brands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT,
  logo_url TEXT,
  description_fr TEXT,
  description_ar TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- TABLE: collections
CREATE TABLE IF NOT EXISTS collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name_fr TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description_fr TEXT,
  description_ar TEXT,
  cover_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- TABLE: tags
CREATE TABLE IF NOT EXISTS tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name_fr TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  slug TEXT UNIQUE,
  show_on_homepage BOOLEAN DEFAULT false,
  homepage_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- TABLE: products
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_type TEXT NOT NULL CHECK (product_type IN ('perfume', 'flacon')),
  name_fr TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description_fr TEXT,
  description_ar TEXT,
  category_id UUID REFERENCES categories(id),
  brand_id UUID REFERENCES brands(id),
  collection_id UUID REFERENCES collections(id),
  price_per_gram NUMERIC,
  stock_grams NUMERIC,
  base_price NUMERIC,
  images TEXT[],
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'draft')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- TABLE: product_tags (junction)
CREATE TABLE IF NOT EXISTS product_tags (
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, tag_id)
);

-- TABLE: flacon_variants
CREATE TABLE IF NOT EXISTS flacon_variants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  size_ml INT,
  color TEXT,
  shape TEXT,
  price NUMERIC NOT NULL,
  stock_units INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- TABLE: orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES profiles(id),
  guest_first_name TEXT,
  guest_last_name TEXT,
  guest_phone TEXT,
  guest_wilaya TEXT,
  total_amount NUMERIC NOT NULL,
  amount_paid NUMERIC DEFAULT 0,
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid')),
  order_status TEXT DEFAULT 'pending' CHECK (
    order_status IN ('pending','confirmed','preparing','shipped','delivered','cancelled')
  ),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- TABLE: order_items
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  flacon_variant_id UUID REFERENCES flacon_variants(id),
  product_name_fr TEXT,
  product_name_ar TEXT,
  quantity_grams NUMERIC,
  quantity_units INT,
  unit_price NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL
);

-- TABLE: invoices
CREATE TABLE IF NOT EXISTS invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number TEXT UNIQUE NOT NULL,
  order_id UUID REFERENCES orders(id),
  generated_at TIMESTAMPTZ DEFAULT now(),
  pdf_url TEXT
);

-- TABLE: announcements
CREATE TABLE IF NOT EXISTS announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  text_fr TEXT NOT NULL,
  text_ar TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- TABLE: notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT,
  message TEXT,
  is_read BOOLEAN DEFAULT false,
  related_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- TABLE: settings
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value JSONB
);

-- SEQUENCES / RPC
CREATE SEQUENCE IF NOT EXISTS order_seq START 1;
CREATE SEQUENCE IF NOT EXISTS invoice_seq START 1;

CREATE OR REPLACE FUNCTION next_order_number() RETURNS BIGINT AS $$
  BEGIN
    RETURN nextval('order_seq');
  END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION next_invoice_number() RETURNS BIGINT AS $$
  BEGIN
    RETURN nextval('invoice_seq');
  END;
$$ LANGUAGE plpgsql;

-- RLS POLICIES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE flacon_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Product policies: Public read, Admin write
CREATE POLICY "Public read products" ON products FOR SELECT USING (status = 'active');
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read brands" ON brands FOR SELECT USING (true);
CREATE POLICY "Public read collections" ON collections FOR SELECT USING (true);
CREATE POLICY "Public read tags" ON tags FOR SELECT USING (true);

-- Admin role check function (simplified for policy use)
CREATE POLICY "Admin full access products" ON products FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'owner'))
);

-- Profiles: User own access, Admin full access
CREATE POLICY "User read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "User update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin full profiles" ON profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'owner'))
);

