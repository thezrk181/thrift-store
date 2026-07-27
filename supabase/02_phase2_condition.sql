-- ==========================================
-- PHASE 2: ADD CONDITION COLUMN
-- Run this in your Supabase SQL Editor
-- ==========================================

-- Safely add the new condition column to the existing products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS condition TEXT DEFAULT 'Good';
