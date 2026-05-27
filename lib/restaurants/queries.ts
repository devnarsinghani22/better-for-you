import { createClient } from '@/lib/supabase/server';

// Prod shows only Live restaurants; staging/preview also shows Draft (the
// service-role client bypasses RLS there). Mirrors lib/products/visibility.
export function visibleRestaurantStatuses(): readonly string[] {
  return process.env.VERCEL_ENV === 'production' ? ['Live'] : ['Live', 'Draft'];
}

export type RestaurantCard = {
  id: number;
  slug: string;
  name: string;
  city: string;
  area: string | null;
  hero_image_url: string | null;
  is_new: boolean;
  approvedCount: number;
};

// Visible restaurants that have at least one approved dish, with their approved
// dish count. Ordered by display_order; grouping by city happens in the page.
export async function getVisibleRestaurants(): Promise<RestaurantCard[]> {
  const sb = await createClient();
  const { data: rs } = await sb
    .from('restaurants')
    .select('id, slug, name, city, area, hero_image_url, is_new, display_order, status')
    .in('status', visibleRestaurantStatuses() as string[])
    .order('display_order', { ascending: true });
  const restaurants = rs ?? [];
  if (restaurants.length === 0) return [];

  const ids = restaurants.map((r) => r.id);
  const { data: ds } = await sb
    .from('dishes')
    .select('restaurant_id')
    .eq('approved', true)
    .in('restaurant_id', ids);
  const counts = new Map<number, number>();
  for (const d of ds ?? []) counts.set(d.restaurant_id, (counts.get(d.restaurant_id) ?? 0) + 1);

  return restaurants
    .map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      city: r.city,
      area: r.area,
      hero_image_url: r.hero_image_url,
      is_new: r.is_new,
      approvedCount: counts.get(r.id) ?? 0,
    }))
    .filter((r) => r.approvedCount > 0);
}

export async function getRestaurantBySlug(slug: string) {
  const sb = await createClient();
  const { data: r } = await sb
    .from('restaurants')
    .select('id, slug, name, city, area, menu_url, hero_image_url, is_new, status')
    .eq('slug', slug)
    .in('status', visibleRestaurantStatuses() as string[])
    .single();
  if (!r) return null;

  const { data: dishes } = await sb
    .from('dishes')
    .select('id, name, slug, blurb, display_order')
    .eq('restaurant_id', r.id)
    .eq('approved', true)
    .order('display_order', { ascending: true });

  return { ...r, dishes: dishes ?? [] };
}
