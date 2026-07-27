-- ==========================================
-- PHASE 3: USER ACCOUNTS & RETENTION
-- Run this in your Supabase SQL Editor
-- ==========================================

-- 1. ADD SAVED ADDRESS TO PROFILES
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS saved_address JSONB;

-- 2. CREATE WISHLISTS TABLE
CREATE TABLE IF NOT EXISTS public.wishlists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, product_id)
);

-- Enable RLS for wishlists
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

-- Safely drop existing policies before creating them to avoid deadlock/already exists errors
DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view their own wishlists." ON public.wishlists;
    DROP POLICY IF EXISTS "Users can insert their own wishlists." ON public.wishlists;
    DROP POLICY IF EXISTS "Users can delete their own wishlists." ON public.wishlists;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

CREATE POLICY "Users can view their own wishlists." 
ON public.wishlists FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wishlists." 
ON public.wishlists FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wishlists." 
ON public.wishlists FOR DELETE 
USING (auth.uid() = user_id);

-- 3. AUTO-CREATE PROFILE ON USER SIGNUP
-- Create the function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, created_at, updated_at)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to prevent errors, then create it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
