-- 2026-05-18: Yogurt hero image (overhead bowl on blue) uploaded + wired.
UPDATE public.categories
SET hero_image_url = 'https://eprwzftfxtkgunnkewyk.supabase.co/storage/v1/object/public/categories/yogurt.jpg'
WHERE slug = 'yogurt';
