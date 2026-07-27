-- ==========================================
-- PHASE 1: CHECKOUT & INVENTORY
-- Run this in your Supabase SQL Editor
-- ==========================================

-- 1. Safely add the new order_number column to the existing orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_number TEXT;
ALTER TABLE public.orders ADD CONSTRAINT unique_order_number UNIQUE (order_number);

-- 2. Create the new checkout function
CREATE OR REPLACE FUNCTION public.place_order_with_inventory(
  p_user_id UUID,
  p_shipping_address JSONB,
  p_total_amount NUMERIC,
  p_items JSONB
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
  -- Generate a unique 8-character alphanumeric order number
  v_order_number := 'ORD-' || upper(substr(md5(random()::text), 1, 8));

  -- Create the order record
  INSERT INTO public.orders (order_number, user_id, status, total_amount, shipping_address)
  VALUES (v_order_number, p_user_id, 'pending', p_total_amount, p_shipping_address)
  RETURNING id INTO v_order_id;

  -- Loop through items, check inventory, decrement, and create order_items
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

  -- Return success with the new order ID and order number
  RETURN jsonb_build_object('success', true, 'order_id', v_order_id, 'order_number', v_order_number);
EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$;
