import { describe, it, expect } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

describe('categories RLS', () => {
  it('anon role can read active categories', async () => {
    const supabase = createClient(url, anonKey);
    const { data, error } = await supabase
      .from('categories')
      .select('slug, name')
      .eq('active', true);

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data!.length).toBeGreaterThanOrEqual(5);
    const slugs = data!.map((c) => c.slug).sort();
    expect(slugs).toEqual(['biscuits', 'noodles', 'paneer', 'peanut-butter', 'rusks']);
  });

  it('anon role cannot insert into categories', async () => {
    const supabase = createClient(url, anonKey);
    const { error } = await supabase
      .from('categories')
      .insert({ slug: 'evil', name: 'Evil', display_order: 999 });
    expect(error).not.toBeNull();
  });
});
