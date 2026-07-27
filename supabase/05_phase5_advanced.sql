-- ==========================================
-- PHASE 5: ADVANCED ADMIN & ANALYTICS
-- Run this in your Supabase SQL Editor
-- ==========================================

-- 1. PROMO CODES
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount', 'free_shipping')),
  discount_value NUMERIC(10, 2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
-- Everyone can read active promo codes (to validate at checkout)
DROP POLICY IF EXISTS "Public can view active promo codes" ON public.promo_codes;
CREATE POLICY "Public can view active promo codes" ON public.promo_codes 
  FOR SELECT USING (is_active = true);
-- Admins have full access
DROP POLICY IF EXISTS "Admins have full access to promo codes" ON public.promo_codes;
CREATE POLICY "Admins have full access to promo codes" ON public.promo_codes 
  FOR ALL USING (public.is_admin(auth.uid()));


-- 2. FEATURED PRODUCTS
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;


-- 3. ABANDONED CARTS
CREATE TABLE IF NOT EXISTS public.carts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
-- Users can manage their own cart
DROP POLICY IF EXISTS "Users can manage own cart" ON public.carts;
CREATE POLICY "Users can manage own cart" ON public.carts 
  FOR ALL USING (auth.uid() = user_id);
-- Admins can view all carts
DROP POLICY IF EXISTS "Admins can view all carts" ON public.carts;
CREATE POLICY "Admins can view all carts" ON public.carts 
  FOR SELECT USING (public.is_admin(auth.uid()));


-- 4. EMAIL LOGS (Placeholder for Automated Emails)
CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT DEFAULT 'pending_backend_integration',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view email logs" ON public.email_logs;
CREATE POLICY "Admins can view email logs" ON public.email_logs 
  FOR SELECT USING (public.is_admin(auth.uid()));

-- Trigger to mock an email log whenever an order status changes
CREATE OR REPLACE FUNCTION log_order_status_email()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
BEGIN
  -- Only log if the status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Fetch the user's email if possible
    SELECT email INTO user_email FROM auth.users WHERE id = NEW.user_id;
    
    -- Insert a log placeholder
    IF user_email IS NOT NULL THEN
      INSERT INTO public.email_logs (order_id, recipient_email, subject, status)
      VALUES (NEW.id, user_email, 'Order Status Updated: ' || NEW.status, 'pending_backend_integration');
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_order_status_change ON public.orders;
CREATE TRIGGER on_order_status_change
  AFTER UPDATE OF status ON public.orders
  FOR EACH ROW
  EXECUTE PROCEDURE log_order_status_email();


-- 6. ADMIN CARTS FUNCTION
-- PostgREST cannot join auth.users directly. This function allows admins to securely fetch carts with user emails.
CREATE OR REPLACE FUNCTION public.get_admin_carts()
RETURNS TABLE (
  id UUID,
  updated_at TIMESTAMP WITH TIME ZONE,
  items JSONB,
  user_id UUID,
  first_name TEXT,
  last_name TEXT,
  email VARCHAR
) AS $$
BEGIN
  -- Check if user is admin
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT 
    c.id,
    c.updated_at,
    c.items,
    c.user_id,
    p.first_name,
    p.last_name,
    u.email
  FROM public.carts c
  LEFT JOIN public.profiles p ON c.user_id = p.id
  LEFT JOIN auth.users u ON c.user_id = u.id
  ORDER BY c.updated_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 7. FIX ADMIN ACCESS TO ORDER ITEMS
-- In Phase 4, we forgot to give admins access to view order_items!
DROP POLICY IF EXISTS "Admins can view all order items." ON public.order_items;
CREATE POLICY "Admins can view all order items." ON public.order_items
  FOR SELECT USING (public.is_admin(auth.uid()));
