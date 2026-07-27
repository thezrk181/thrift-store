-- ==========================================
-- PHASE 4: ADMIN ACCOUNTS & PERMISSIONS
-- Run this in your Supabase SQL Editor
-- ==========================================

-- 1. Add is_admin column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- 2. Create the helper function to securely check if the current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean AS $$
DECLARE
  admin_status boolean;
BEGIN
  SELECT is_admin INTO admin_status FROM public.profiles WHERE id = user_id;
  RETURN COALESCE(admin_status, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Add RLS Policies for Admins

-- Products (Allow admins to insert, update, delete)
DROP POLICY IF EXISTS "Admins can insert products." ON public.products;
DROP POLICY IF EXISTS "Admins can update products." ON public.products;
DROP POLICY IF EXISTS "Admins can delete products." ON public.products;

CREATE POLICY "Admins can insert products." ON public.products
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update products." ON public.products
  FOR UPDATE USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete products." ON public.products
  FOR DELETE USING (public.is_admin(auth.uid()));

-- Product Images
DROP POLICY IF EXISTS "Admins can insert product images." ON public.product_images;
DROP POLICY IF EXISTS "Admins can update product images." ON public.product_images;
DROP POLICY IF EXISTS "Admins can delete product images." ON public.product_images;

CREATE POLICY "Admins can insert product images." ON public.product_images
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update product images." ON public.product_images
  FOR UPDATE USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete product images." ON public.product_images
  FOR DELETE USING (public.is_admin(auth.uid()));

-- Product Variants
DROP POLICY IF EXISTS "Admins can insert product variants." ON public.product_variants;
DROP POLICY IF EXISTS "Admins can update product variants." ON public.product_variants;
DROP POLICY IF EXISTS "Admins can delete product variants." ON public.product_variants;

CREATE POLICY "Admins can insert product variants." ON public.product_variants
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update product variants." ON public.product_variants
  FOR UPDATE USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete product variants." ON public.product_variants
  FOR DELETE USING (public.is_admin(auth.uid()));

-- Orders (Allow admins to view all and update status)
DROP POLICY IF EXISTS "Admins can view all orders." ON public.orders;
DROP POLICY IF EXISTS "Admins can update all orders." ON public.orders;

CREATE POLICY "Admins can view all orders." ON public.orders
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all orders." ON public.orders
  FOR UPDATE USING (public.is_admin(auth.uid()));

-- Profiles (Allow admins to view all profiles to see users)
DROP POLICY IF EXISTS "Admins can view all profiles." ON public.profiles;

CREATE POLICY "Admins can view all profiles." ON public.profiles
  FOR SELECT USING (public.is_admin(auth.uid()));

-- Storage Bucket (Allow admins to upload, update, delete images)
DROP POLICY IF EXISTS "Admins can update product images." ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete product images." ON storage.objects;

CREATE POLICY "Admins can update product images." ON storage.objects
  FOR UPDATE USING (bucket_id = 'product-images' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete product images." ON storage.objects
  FOR DELETE USING (bucket_id = 'product-images' AND public.is_admin(auth.uid()));

-- (The existing INSERT policy for authenticated users allows uploads, but we can make it admin only if we want. We'll leave it as authenticated for now since we just restrict via bucket name and RLS, or we can tighten it:)
DROP POLICY IF EXISTS "Only authenticated users can upload product images." ON storage.objects;

CREATE POLICY "Only admins can upload product images." ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-images' AND public.is_admin(auth.uid()));
