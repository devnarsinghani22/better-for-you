import { createClient } from '@/lib/supabase/server';
import { visibleProductStatuses } from '@/lib/products/visibility';
import {
  previewCategoriesEnabled,
  STAGING_CATEGORY_ORDER_MIN,
} from '@/lib/categories/visibility';

// A category is visible if active, or (on staging) a sentinel preview category.
function categoryVisible(cat: { active?: boolean; display_order?: number | null } | null) {
  if (!cat) return false;
  return Boolean(
    cat.active ||
      (previewCategoriesEnabled() &&
        (cat.display_order ?? 0) >= STAGING_CATEGORY_ORDER_MIN)
  );
}

export async function getLiveCountByCategory(): Promise<Map<number, number>> {
  const sb = await createClient();
  const { data, error } = await sb
    .from('products')
    .select('category_id')
    .in('status', visibleProductStatuses() as string[]);
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
    .select('id, active, display_order')
    .eq('slug', categorySlug)
    .single();
  if (!cat || !categoryVisible(cat)) return [];

  const { data, error } = await sb
    .from('products')
    .select(`
      id, slug, name, variant_size, rating, certification_method,
      product_photo_url, label_image_url, primary_buy_url, last_verified_at,
      ingredients_raw,
      brand:brands ( slug, name )
    `)
    .in('status', visibleProductStatuses() as string[])
    .eq('category_id', cat.id);
  if (error) throw error;
  const rows = data ?? [];
  const brandName = (p: (typeof rows)[number]) => {
    const b = Array.isArray(p.brand) ? p.brand[0] : p.brand;
    return b?.name ?? '';
  };
  rows.sort(
    (a, b) =>
      brandName(a).localeCompare(brandName(b)) ||
      a.name.localeCompare(b.name)
  );
  return rows;
}

export async function getLiveProductBySlug(categorySlug: string, productSlug: string) {
  const sb = await createClient();
  const { data: cat } = await sb
    .from('categories')
    .select('id, slug, name, blurb, active, display_order')
    .eq('slug', categorySlug)
    .single();
  if (!cat || !categoryVisible(cat)) return null;

  const { data, error } = await sb
    .from('products')
    .select(`
      *,
      brand:brands ( slug, name, website_url )
    `)
    .in('status', visibleProductStatuses() as string[])
    .eq('slug', productSlug)
    .eq('category_id', cat.id)
    .single();
  if (error) return null;
  return { ...data, category: cat };
}
