-- ==========================================
-- SEED DATA FOR "SOLE WALA"
-- ==========================================

-- Clear existing data if you're re-running this
DELETE FROM public.products;

-- 1. Insert Products
INSERT INTO public.products (id, slug, name, description, base_price, category, tags) VALUES
('11111111-1111-1111-1111-111111111111', 'supernova-rise-2', 'Supernova Rise 2', 'A daily trainer built for effortless miles. Energy return foam, breathable mesh upper, and a sculpted midsole for the long haul.', 33600, 'Running', '{"men", "new"}'),
('22222222-2222-2222-2222-222222222222', 'adizero-adios-4', 'Adizero Adios Pro 4', 'Race-day weapon. Carbon-infused plate, ultra-light cushioning, and a locked-in fit for personal bests.', 67200, 'Racing', '{"men", "sale"}'),
('33333333-3333-3333-3333-333333333333', 'shift-fwd', 'Shift FWD Runner', 'Forward geometry. A responsive ride shaped for tempo runs and long weekend efforts.', 40600, 'Running', '{"women", "new"}'),
('44444444-4444-4444-4444-444444444444', 'campus-84', 'Campus 84', 'A heritage silhouette pulled from the archive. Suede overlays, gum sole, everyday wear.', 26600, 'Lifestyle', '{"men", "women"}'),
('55555555-5555-5555-5555-555555555555', 'atlas-chunk', 'Atlas Chunk', 'Oversized proportions, quiet color. A chunky silhouette that stays refined.', 44800, 'Lifestyle', '{"women"}'),
('66666666-6666-6666-6666-666666666666', 'court-og', 'Court OG', 'A clean court shoe. Low profile, leather upper, everyday-simple.', 23800, 'Lifestyle', '{"men", "sale"}'),
('77777777-7777-7777-7777-777777777777', 'phantom-black', 'Phantom Black', 'All-black tonal build. Engineered mesh, technical sole unit, no distractions.', 49000, 'Performance', '{"men"}'),
('88888888-8888-8888-8888-888888888888', 'solar-orange', 'Solar Orange', 'Loud color, quiet ride. A bold statement built on a proven cushioning platform.', 37800, 'Running', '{"women", "sale"}');


-- 2. Insert Product Images (Assuming the files are named shoe-1.jpg etc. in your Supabase storage)
INSERT INTO public.product_images (product_id, image_path, is_primary, display_order) VALUES
('11111111-1111-1111-1111-111111111111', 'shoe-1.jpg', true, 1),
('22222222-2222-2222-2222-222222222222', 'shoe-2.jpg', true, 1),
('33333333-3333-3333-3333-333333333333', 'shoe-3.jpg', true, 1),
('44444444-4444-4444-4444-444444444444', 'shoe-4.jpg', true, 1),
('55555555-5555-5555-5555-555555555555', 'shoe-5.jpg', true, 1),
('66666666-6666-6666-6666-666666666666', 'shoe-6.jpg', true, 1),
('77777777-7777-7777-7777-777777777777', 'shoe-7.jpg', true, 1),
('88888888-8888-8888-8888-888888888888', 'shoe-8.jpg', true, 1);


-- 3. Insert Product Variants (Colors & Sizes with default stock 10)
-- Supernova Rise 2
INSERT INTO public.product_variants (product_id, color_name, color_hex, size, stock_quantity) VALUES
('11111111-1111-1111-1111-111111111111', 'White / Blue', '#e6ecf5', '8', 10),
('11111111-1111-1111-1111-111111111111', 'White / Blue', '#e6ecf5', '9', 10),
('11111111-1111-1111-1111-111111111111', 'White / Blue', '#e6ecf5', '10', 10),
('11111111-1111-1111-1111-111111111111', 'Black', '#111111', '9', 10),
('11111111-1111-1111-1111-111111111111', 'Cream', '#e9e4d8', '9', 10);

-- Adizero Adios Pro 4
INSERT INTO public.product_variants (product_id, color_name, color_hex, size, stock_quantity) VALUES
('22222222-2222-2222-2222-222222222222', 'Chalk', '#efece4', '9', 10),
('22222222-2222-2222-2222-222222222222', 'Ink', '#1a1a1a', '9', 10);

-- Shift FWD Runner
INSERT INTO public.product_variants (product_id, color_name, color_hex, size, stock_quantity) VALUES
('33333333-3333-3333-3333-333333333333', 'Slate / Lime', '#5a6470', '7', 10),
('33333333-3333-3333-3333-333333333333', 'Storm', '#3a3f47', '7', 10);

-- Campus 84
INSERT INTO public.product_variants (product_id, color_name, color_hex, size, stock_quantity) VALUES
('44444444-4444-4444-4444-444444444444', 'Navy / Gum', '#1e2a44', '10', 10),
('44444444-4444-4444-4444-444444444444', 'Black / Gum', '#0e0e0e', '10', 10);

-- Atlas Chunk
INSERT INTO public.product_variants (product_id, color_name, color_hex, size, stock_quantity) VALUES
('55555555-5555-5555-5555-555555555555', 'Sand', '#c9b99a', '8', 10),
('55555555-5555-5555-5555-555555555555', 'Stone', '#a8a196', '8', 10);

-- Court OG
INSERT INTO public.product_variants (product_id, color_name, color_hex, size, stock_quantity) VALUES
('66666666-6666-6666-6666-666666666666', 'Olive', '#5c6a3a', '11', 10),
('66666666-6666-6666-6666-666666666666', 'White', '#f2f2f2', '11', 10);

-- Phantom Black
INSERT INTO public.product_variants (product_id, color_name, color_hex, size, stock_quantity) VALUES
('77777777-7777-7777-7777-777777777777', 'Triple Black', '#000000', '9.5', 10),
('77777777-7777-7777-7777-777777777777', 'Graphite', '#2a2a2a', '9.5', 10);

-- Solar Orange
INSERT INTO public.product_variants (product_id, color_name, color_hex, size, stock_quantity) VALUES
('88888888-8888-8888-8888-888888888888', 'Solar', '#ff5a1f', '8.5', 10),
('88888888-8888-8888-8888-888888888888', 'Ember', '#c94a1c', '8.5', 10);
