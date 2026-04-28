-- 2026-04-28: category hero images + product lab reports
-- 1. Add hero_image_url to categories.
-- 2. Add lab_report_url to products.
-- 3. Populate category hero URLs (5 categories) from Supabase Storage 'categories' bucket.
-- 4. Populate paneer lab_report_url for 7 Live products from Supabase Storage 'reports' bucket.

BEGIN;

ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS hero_image_url TEXT;
ALTER TABLE public.products  ADD COLUMN IF NOT EXISTS lab_report_url TEXT;

-- Category hero images
UPDATE public.categories SET hero_image_url = 'https://eprwzftfxtkgunnkewyk.supabase.co/storage/v1/object/public/categories/paneer.jpg'        WHERE slug = 'paneer';
UPDATE public.categories SET hero_image_url = 'https://eprwzftfxtkgunnkewyk.supabase.co/storage/v1/object/public/categories/peanut-butter.jpg' WHERE slug = 'peanut-butter';
UPDATE public.categories SET hero_image_url = 'https://eprwzftfxtkgunnkewyk.supabase.co/storage/v1/object/public/categories/biscuits.jpg'      WHERE slug = 'biscuits';
UPDATE public.categories SET hero_image_url = 'https://eprwzftfxtkgunnkewyk.supabase.co/storage/v1/object/public/categories/noodles.jpg'       WHERE slug = 'noodles';
UPDATE public.categories SET hero_image_url = 'https://eprwzftfxtkgunnkewyk.supabase.co/storage/v1/object/public/categories/rusks.jpg'         WHERE slug = 'rusks';

-- Paneer lab reports (Eurofins, uploaded from Drive)
UPDATE public.products SET lab_report_url = 'https://eprwzftfxtkgunnkewyk.supabase.co/storage/v1/object/public/reports/amul-fresh-paneer.pdf'              WHERE slug = 'amul-fresh-paneer';
UPDATE public.products SET lab_report_url = 'https://eprwzftfxtkgunnkewyk.supabase.co/storage/v1/object/public/reports/amul-malai-paneer.pdf'             WHERE slug = 'amul-malai-paneer';
UPDATE public.products SET lab_report_url = 'https://eprwzftfxtkgunnkewyk.supabase.co/storage/v1/object/public/reports/desi-farms-low-fat-paneer.pdf'     WHERE slug = 'desi-farms-low-fat-paneer';
UPDATE public.products SET lab_report_url = 'https://eprwzftfxtkgunnkewyk.supabase.co/storage/v1/object/public/reports/gowardhan-paneer.pdf'              WHERE slug = 'gowardhan-paneer';
UPDATE public.products SET lab_report_url = 'https://eprwzftfxtkgunnkewyk.supabase.co/storage/v1/object/public/reports/humpy-a2-paneer.pdf'               WHERE slug = 'humpy-a2-paneer';
UPDATE public.products SET lab_report_url = 'https://eprwzftfxtkgunnkewyk.supabase.co/storage/v1/object/public/reports/id-fresh-high-protein-paneer.pdf'  WHERE slug = 'id-fresh-high-protein-paneer';
UPDATE public.products SET lab_report_url = 'https://eprwzftfxtkgunnkewyk.supabase.co/storage/v1/object/public/reports/milky-mist-high-protein-paneer.pdf' WHERE slug = 'milky-mist-high-protein-paneer';

COMMIT;
