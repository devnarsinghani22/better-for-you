-- Update the Tempeh category hero to v2 (new bowl-of-cubes photo).
update categories
   set hero_image_url = 'https://eprwzftfxtkgunnkewyk.supabase.co/storage/v1/object/public/categories/tempeh-v2.jpg'
 where slug = 'tempeh';
