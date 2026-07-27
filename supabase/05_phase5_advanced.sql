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
CREATE POLICY "Public can view active promo codes" ON public.promo_codes 
  FOR SELECT USING (is_active = true);
-- Admins have full access
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
CREATE POLICY "Users can manage own cart" ON public.carts 
  FOR ALL USING (auth.uid() = user_id);
-- Admins can view all carts
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
