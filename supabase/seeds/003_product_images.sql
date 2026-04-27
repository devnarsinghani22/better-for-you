-- Product photo + label image URLs (sourced from brand sites, verified)
UPDATE public.products SET product_photo_url = 'https://www.thehealthfactory.in/cdn/shop/files/Cinnamon_Rusk_-_1.webp?v=1768821646' WHERE slug = 'zero-maida-rusk';
UPDATE public.products SET product_photo_url = 'https://earlyfoods.com/cdn/shop/files/81_26e8c0c0-543e-4107-a842-78243558d5a7.jpg?v=1773128767' WHERE slug = 'millet-rusk';
UPDATE public.products SET product_photo_url = 'https://earlyfoods.com/cdn/shop/files/34_dcce608f-e08d-4260-b4dd-e4a38f38d2cb.png?v=1772788864' WHERE slug = 'millet-jaggery-cookies';
UPDATE public.products SET product_photo_url = 'https://kikibix.com/cdn/shop/files/Millet_Choco_Chip.jpg?v=1757680967' WHERE slug = 'millet-chocolate-chip';
UPDATE public.products SET
  product_photo_url = 'https://shopcdn.mylittlemoppet.com/wp-content/uploads/2017/03/98-Wheat-Noodles-13cm-X-16-cm-Product-Pic_1-700x700.jpg',
  label_image_url   = 'https://shopcdn.mylittlemoppet.com/wp-content/uploads/2017/03/98-Wheat-Noodles-13cm-X-16-cm_2-700x867.jpg'
WHERE slug = 'wheat-noodles-little-moppet';
UPDATE public.products SET
  product_photo_url = 'https://naturallyyours.in/cdn/shop/files/6_9211ea6e-b4f6-4948-8714-41bc42dda1e5.png?v=1727815745',
  label_image_url   = 'https://naturallyyours.in/cdn/shop/files/Copy_of_Quinoa_Noodles_180G_2.png?v=1765593224'
WHERE slug = 'quinoa-noodles-naturally';
UPDATE public.products SET product_photo_url = 'https://myfitness.in/cdn/shop/files/myfitness-original-peanut-butter-crunchy-1773490264_78fc3fa4-6f76-49b8-bc41-8eab4f4d20da.webp?v=1775741256' WHERE slug = 'myfitness-crunchy-pb';
UPDATE public.products SET
  product_photo_url = 'https://nutroasters.in/cdn/shop/products/jaggerypeanutbutterindia1_1024x1024.jpg?v=1694697510',
  label_image_url   = 'https://nutroasters.in/cdn/shop/files/NutRoasters2_Jaggery_1-01_600x600@2x.png?v=1729602554'
WHERE slug = 'nut-roasters-crunchy-pb';
UPDATE public.products SET product_photo_url = 'https://www.amul.com/files/products/Fresh-Paneer_100g_with_yellow_bg.jpg' WHERE slug = 'amul-fresh-paneer';
UPDATE public.products SET product_photo_url = 'https://www.amul.com/files/products/Malai-Paneer_vertical_yellow_bg.jpg' WHERE slug = 'amul-malai-paneer';
UPDATE public.products SET
  product_photo_url = 'https://humpyfarms.com/cdn/shop/files/paneer-02_1.jpg?v=1716281197',
  label_image_url   = 'https://humpyfarms.com/cdn/shop/files/paneer-03_1.jpg?v=1716281197'
WHERE slug = 'humpy-a2-paneer';
UPDATE public.products SET product_photo_url = 'https://www.idfreshfood.com/wp-content/uploads/2025/06/452x445-paneer.png' WHERE slug = 'id-fresh-high-protein-paneer';
UPDATE public.products SET
  product_photo_url = 'https://static.wixstatic.com/media/60b717_742384d3011c4712af7bd0adb8cf005b~mv2.png/v1/fill/w_600,h_337,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/200g.png',
  label_image_url   = 'https://static.wixstatic.com/media/60b717_28ee82cdcfab49959400565c151929c5~mv2.png/v1/fill/w_448,h_448,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/1kg.png'
WHERE slug = 'milky-mist-high-protein-paneer';

-- gowardhan-paneer + desi-farms-low-fat-paneer have no clean public image URLs available; left null.
