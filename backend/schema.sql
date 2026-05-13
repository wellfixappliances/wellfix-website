-- ============================================================
-- WELLFIX ERP — SUPABASE DATABASE SCHEMA
-- Run this entire file in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── PROFILES (extends Supabase auth.users) ──────────────────
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role TEXT DEFAULT 'staff' CHECK (role IN ('super_admin','admin','staff','inventory','content')),
  avatar_url TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── CATEGORIES ───────────────────────────────────────────────
CREATE TABLE categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  parent_id UUID REFERENCES categories(id),
  image_url TEXT,
  icon TEXT,
  description TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── BRANDS ───────────────────────────────────────────────────
CREATE TABLE brands (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── PRODUCTS ─────────────────────────────────────────────────
CREATE TABLE products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  sku TEXT UNIQUE,
  brand_id UUID REFERENCES brands(id),
  category_id UUID REFERENCES categories(id),
  price DECIMAL(10,2) NOT NULL,
  mrp DECIMAL(10,2),
  cost_price DECIMAL(10,2),
  stock_qty INT DEFAULT 0,
  low_stock_threshold INT DEFAULT 5,
  warranty TEXT,
  badge TEXT CHECK (badge IN ('hot','sale','new','')),
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  is_trending BOOLEAN DEFAULT false,
  specifications JSONB DEFAULT '{}',
  tags TEXT[],
  weight DECIMAL(8,2),
  seo_title TEXT,
  seo_description TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── PRODUCT IMAGES ───────────────────────────────────────────
CREATE TABLE product_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt TEXT,
  sort_order INT DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── BANNERS ──────────────────────────────────────────────────
CREATE TABLE banners (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  cta_text TEXT,
  cta_url TEXT,
  desktop_image_url TEXT,
  mobile_image_url TEXT,
  badge_text TEXT,
  position TEXT DEFAULT 'hero' CHECK (position IN ('hero','promo','category')),
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── HOMEPAGE SECTIONS ────────────────────────────────────────
CREATE TABLE homepage_sections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  section_key TEXT UNIQUE NOT NULL,
  title TEXT,
  subtitle TEXT,
  is_visible BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  config JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── CUSTOMERS ────────────────────────────────────────────────
CREATE TABLE customers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  whatsapp TEXT,
  address TEXT,
  city TEXT,
  district TEXT,
  state TEXT DEFAULT 'Kerala',
  pincode TEXT,
  notes TEXT,
  total_orders INT DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── ORDERS ───────────────────────────────────────────────────
CREATE TABLE orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  shipping_address TEXT NOT NULL,
  shipping_city TEXT,
  shipping_district TEXT,
  shipping_pincode TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled','returned')),
  payment_method TEXT DEFAULT 'cod' CHECK (payment_method IN ('cod','online','upi')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','failed','refunded')),
  subtotal DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) DEFAULT 0,
  shipping_fee DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  coupon_code TEXT,
  notes TEXT,
  whatsapp_notified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── ORDER ITEMS ──────────────────────────────────────────────
CREATE TABLE order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL,
  product_image TEXT,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── SERVICE BOOKINGS ─────────────────────────────────────────
CREATE TABLE service_bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  booking_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT,
  service_type TEXT NOT NULL,
  appliance_brand TEXT,
  issue_description TEXT,
  preferred_date DATE,
  preferred_time TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new','assigned','in_progress','completed','cancelled')),
  technician_name TEXT,
  service_charge DECIMAL(10,2),
  parts_charge DECIMAL(10,2),
  total_charge DECIMAL(10,2),
  payment_status TEXT DEFAULT 'pending',
  notes TEXT,
  whatsapp_notified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── REVIEWS ──────────────────────────────────────────────────
CREATE TABLE reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT,
  body TEXT,
  is_approved BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  images TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── BLOG POSTS ───────────────────────────────────────────────
CREATE TABLE blog_posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT,
  featured_image TEXT,
  category TEXT,
  tags TEXT[],
  author_id UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  views INT DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── COUPONS ──────────────────────────────────────────────────
CREATE TABLE coupons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  type TEXT DEFAULT 'percentage' CHECK (type IN ('percentage','fixed')),
  value DECIMAL(10,2) NOT NULL,
  min_order_amount DECIMAL(10,2) DEFAULT 0,
  max_discount DECIMAL(10,2),
  usage_limit INT,
  used_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── MEDIA LIBRARY ────────────────────────────────────────────
CREATE TABLE media (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  filename TEXT NOT NULL,
  original_name TEXT,
  url TEXT NOT NULL,
  size INT,
  mime_type TEXT,
  folder TEXT DEFAULT 'general',
  uploaded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── SITE SETTINGS ────────────────────────────────────────────
CREATE TABLE site_settings (
  key TEXT PRIMARY KEY,
  value JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── SEED: Default homepage sections ─────────────────────────
INSERT INTO homepage_sections (section_key, title, is_visible, sort_order) VALUES
('offer_strip', 'Offer Strip', true, 1),
('hero_banners', 'Hero Banners', true, 2),
('categories', 'Browse Categories', true, 3),
('flash_sale', 'Flash Sale', true, 4),
('trending_products', 'Trending Products', true, 5),
('brand_bar', 'Brand Bar', true, 6),
('promo_banners', 'Promo Banners', true, 7),
('services', 'Services Section', true, 8),
('reviews', 'Customer Reviews', true, 9);

-- ── SEED: Default site settings ─────────────────────────────
INSERT INTO site_settings (key, value) VALUES
('store_name', '"WellFix Appliances"'),
('store_phone', '"+91 85900 04349"'),
('store_whatsapp', '"+91 85900 04349"'),
('store_email', '"info@wellfixappliances.com"'),
('store_address', '"Kerala, India"'),
('store_hours', '"Mon–Sat: 9:00 AM – 7:00 PM"'),
('currency', '"INR"'),
('currency_symbol', '"₹"');

-- ── SEED: Default brands ─────────────────────────────────────
INSERT INTO brands (name, slug, is_active) VALUES
('Sujata', 'sujata', true),
('Preethi', 'preethi', true),
('Butterfly', 'butterfly', true),
('Prestige', 'prestige', true),
('Pigeon', 'pigeon', true),
('Havells', 'havells', true),
('Kirloskar', 'kirloskar', true),
('Orient', 'orient', true);

-- ── SEED: Default categories ─────────────────────────────────
INSERT INTO categories (name, slug, sort_order, is_active) VALUES
('Mixers & Grinders', 'mixers-grinders', 1, true),
('Gas Stoves', 'gas-stoves', 2, true),
('Fans', 'fans', 3, true),
('Pressure Cookers', 'pressure-cookers', 4, true),
('Water Motors', 'water-motors', 5, true),
('Washing Machines', 'washing-machines', 6, true),
('Cookware & Pans', 'cookware-pans', 7, true),
('Spare Parts', 'spare-parts', 8, true);

-- ── RLS POLICIES ─────────────────────────────────────────────
-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- Public read for products, categories, brands, banners, reviews (frontend)
CREATE POLICY "Public read products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (is_active = true);
CREATE POLICY "Public read brands" ON brands FOR SELECT USING (is_active = true);
CREATE POLICY "Public read banners" ON banners FOR SELECT USING (is_active = true);
CREATE POLICY "Public read approved reviews" ON reviews FOR SELECT USING (is_approved = true);
CREATE POLICY "Public read published blog" ON blog_posts FOR SELECT USING (status = 'published');
CREATE POLICY "Public read settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Public read homepage sections" ON homepage_sections FOR SELECT USING (true);

-- Admin full access (authenticated users with admin role)
CREATE POLICY "Admin full access products" ON products FOR ALL USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role IN ('super_admin','admin','staff','inventory'))
);
CREATE POLICY "Admin full access orders" ON orders FOR ALL USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role IN ('super_admin','admin','staff'))
);
CREATE POLICY "Admin full access reviews" ON reviews FOR ALL USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role IN ('super_admin','admin','content'))
);
CREATE POLICY "Admin manage banners" ON banners FOR ALL USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role IN ('super_admin','admin','content'))
);
CREATE POLICY "Admin manage settings" ON site_settings FOR ALL USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role IN ('super_admin','admin'))
);
CREATE POLICY "Admin manage media" ON media FOR ALL USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role IN ('super_admin','admin','staff','content'))
);

-- Profiles: users can read own, admins read all
CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admin read all profiles" ON profiles FOR SELECT USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role = 'super_admin')
);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- ── FUNCTIONS ────────────────────────────────────────────────
-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', 'staff');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  num TEXT;
BEGIN
  num := 'WF-' || TO_CHAR(NOW(), 'YYMM') || '-' || LPAD(FLOOR(RANDOM() * 9000 + 1000)::TEXT, 4, '0');
  RETURN num;
END;
$$ LANGUAGE plpgsql;

-- Generate booking number
CREATE OR REPLACE FUNCTION generate_booking_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'SV-' || TO_CHAR(NOW(), 'YYMM') || '-' || LPAD(FLOOR(RANDOM() * 9000 + 1000)::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_banners_updated_at BEFORE UPDATE ON banners FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── STORAGE BUCKETS (run in Supabase dashboard) ───────────────
-- Create these buckets in Supabase Storage:
-- 1. "products"   — public
-- 2. "banners"    — public
-- 3. "reviews"    — public
-- 4. "blog"       — public
-- 5. "media"      — public
-- 6. "avatars"    — public
