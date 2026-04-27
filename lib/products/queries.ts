import { createClient } from '@/lib/supabase/server';

export async function getLiveCountByCategory(): Promise<Map<number, number>> {
  const sb = await createClient();
  const { data, error } = await sb
    .from('products')
    .select('category_id')
    .eq('status', 'Live');
  if (error) throw error;
  const counts = new Map<number, number>();
  for (const row of data ?? []) {
    counts.set(row.category_id, (counts.get(row.category_id) ?? 0) + 1);
  }
  return counts;
}

export async function getLiveProductsForCategory(categorySlug: string) {
  const sb = await createClient();
  const { data: cat } = await sb
    .from('categories')
    .select('id')
    .eq('slug', categorySlug)
    .eq('active', true)
    .single();
  if (!cat) return [];

  const { data, error } = await sb
    .from('products')
    .select(`
      id, slug, name, variant_size, rating, certification_method,
      product_photo_url, label_image_url, primary_buy_url, last_verified_at,
      ingredients_raw,
      brand:brands ( slug, name )
    `)
    .eq('status', 'Live')
    .eq('category_id', cat.id)
    .order('rating', { ascending: true })
    .order('name', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getLiveProductBySlug(categorySlug: string, productSlug: string) {
  const sb = await createClient();
  const { data: cat } = await sb
    .from('categories')
    .select('id, slug, name, blurb')
    .eq('slug', categorySlug)
    .eq('active', true)
    .single();
  if (!cat) return null;

  const { data, error } = await sb
    .from('products')
    .select(`
      *,
      brand:brands ( slug, name, website_url )
    `)
    .eq('status', 'Live')
    .eq('slug', productSlug)
    .eq('category_id', cat.id)
    .single();
  if (error) return null;
  return { ...data, category: cat };
}
