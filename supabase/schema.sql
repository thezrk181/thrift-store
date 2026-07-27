-- ==========================================
-- SUPABASE SCHEMA FOR "SOLE WALA"
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (Extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  base_price NUMERIC(10, 2) NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}'::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are viewable by everyone." ON public.products FOR SELECT USING (true);
-- (Only admins/dashboard can insert/update products, we'll leave that policy for later)

-- 3. PRODUCT IMAGES (Stores Supabase Storage paths)
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  image_path TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0
);

-- Enable RLS for product_images
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Product images are viewable by everyone." ON public.product_images FOR SELECT USING (true);

-- 4. PRODUCT VARIANTS (Sizes, Colors, Inventory)
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  color_name TEXT NOT NULL,
  color_hex TEXT NOT NULL,
  size TEXT NOT NULL,
  stock_quantity INTEGER DEFAULT 0 NOT NULL
);

-- Enable RLS for product_variants
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Product variants are viewable by everyone." ON public.product_variants FOR SELECT USING (true);

-- 5. ORDERS
CREATE TYPE order_status AS ENUM ('pending', 'paid', 'shipped', 'delivered', 'cancelled');

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Nullable for guests
  status order_status DEFAULT 'pending',
  total_amount NUMERIC(10, 2) NOT NULL,
  shipping_address JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure order_number column exists if the table was already created before
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_number TEXT UNIQUE;

-- Enable RLS for orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own orders." ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own orders." ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
-- (Note: For guest checkouts, you'd need a looser policy or a service key, but this is a secure start)

-- 6. ORDER ITEMS
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_variant_id UUID REFERENCES public.product_variants(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price_at_time NUMERIC(10, 2) NOT NULL
);

-- Enable RLS for order_items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own order items." ON public.order_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
  )
);
CREATE POLICY "Users can insert their own order items." ON public.order_items FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
  )
);

-- ==========================================
-- RPC FUNCTIONS
-- ==========================================

-- Safely place an order and decrement inventory in a single transaction
CREATE OR REPLACE FUNCTION public.place_order_with_inventory(
  p_user_id UUID,
  p_shipping_address JSONB,
  p_total_amount NUMERIC,
  p_items JSONB -- Array of { variant_id: UUID, quantity: INTEGER, price_at_time: NUMERIC }
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_id UUID;
  v_order_number TEXT;
  v_item JSONB;
  v_variant_id UUID;
  v_quantity INTEGER;
  v_price NUMERIC;
  v_current_stock INTEGER;
BEGIN
  -- 1. Generate a unique 8-character alphanumeric order number
  v_order_number := 'ORD-' || upper(substr(md5(random()::text), 1, 8));

  -- 2. Create the order record
  INSERT INTO public.orders (order_number, user_id, status, total_amount, shipping_address)
  VALUES (v_order_number, p_user_id, 'pending', p_total_amount, p_shipping_address)
  RETURNING id INTO v_order_id;

  -- 3. Loop through items, check inventory, decrement, and create order_items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_variant_id := (v_item->>'variant_id')::UUID;
    v_quantity := (v_item->>'quantity')::INTEGER;
    v_price := (v_item->>'price_at_time')::NUMERIC;

    -- Lock the row for update to prevent concurrent race conditions
    SELECT stock_quantity INTO v_current_stock
    FROM public.product_variants
    WHERE id = v_variant_id
    FOR UPDATE;

    IF v_current_stock IS NULL THEN
      RAISE EXCEPTION 'Variant ID % does not exist.', v_variant_id;
    END IF;

    IF v_current_stock < v_quantity THEN
      RAISE EXCEPTION 'Insufficient stock for variant %. Requested: %, Available: %', v_variant_id, v_quantity, v_current_stock;
    END IF;

    -- Decrement stock
    UPDATE public.product_variants
    SET stock_quantity = stock_quantity - v_quantity
    WHERE id = v_variant_id;

    -- Insert order item
    INSERT INTO public.order_items (order_id, product_variant_id, quantity, price_at_time)
    VALUES (v_order_id, v_variant_id, v_quantity, v_price);
  END LOOP;

  -- 4. Return success with the new order ID and order number
  RETURN jsonb_build_object('success', true, 'order_id', v_order_id, 'order_number', v_order_number);
EXCEPTION
  WHEN OTHERS THEN
    -- If any error occurs, the transaction automatically rolls back.
    -- We re-raise the error so the client knows what failed.
    RAISE;
END;
$$;

-- ==========================================
-- STORAGE BUCKETS
-- ==========================================

-- Insert the product-images bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up Storage RLS Policies
CREATE POLICY "Product images are publicly accessible." 
  ON storage.objects FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Only authenticated users can upload product images." 
  ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'product-images' AND auth.role() = 'authenticated'
  );
