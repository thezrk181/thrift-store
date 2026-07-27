-- ==========================================
-- PHASE 5: GROWTH & CONVERSION FEATURES
-- Run this in your Supabase SQL Editor
-- ==========================================

-- 1. PRODUCT REVIEWS
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  -- A user can only review a product once
  UNIQUE(product_id, user_id)
);

ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- Everyone can read product reviews
DROP POLICY IF EXISTS "Public can view product reviews" ON public.product_reviews;
CREATE POLICY "Public can view product reviews" ON public.product_reviews 
  FOR SELECT USING (true);

-- Authenticated users can insert their own reviews
DROP POLICY IF EXISTS "Users can insert their own reviews" ON public.product_reviews;
CREATE POLICY "Users can insert their own reviews" ON public.product_reviews 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update/delete their own reviews
DROP POLICY IF EXISTS "Users can update own reviews" ON public.product_reviews;
CREATE POLICY "Users can update own reviews" ON public.product_reviews 
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own reviews" ON public.product_reviews;
CREATE POLICY "Users can delete own reviews" ON public.product_reviews 
  FOR DELETE USING (auth.uid() = user_id);

-- Admins can manage all reviews
DROP POLICY IF EXISTS "Admins can manage all reviews" ON public.product_reviews;
CREATE POLICY "Admins can manage all reviews" ON public.product_reviews 
  FOR ALL USING (public.is_admin(auth.uid()));


-- 2. NEWSLETTER SUBSCRIBERS
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Anyone can subscribe to the newsletter
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can subscribe to newsletter" ON public.newsletter_subscribers 
  FOR INSERT WITH CHECK (true);

-- Only admins can view the subscriber list
DROP POLICY IF EXISTS "Admins can view subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admins can view subscribers" ON public.newsletter_subscribers 
  FOR SELECT USING (public.is_admin(auth.uid()));
