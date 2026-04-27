import { describe, it, expect } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

describe('products RLS', () => {
  it('anon sees only Live products', async () => {
    const sb = createClient(url, anon);
    const { data, error } = await sb.from('products').select('slug, status');
    expect(error).toBeNull();
    expect(data!.length).toBeGreaterThan(0);
    for (const p of data!) {
      expect(p.status).toBe('Live');
    }
  });

  it('anon cannot insert', async () => {
    const sb = createClient(url, anon);
    const { error } = await sb.from('products').insert({
      slug: 'evil-test',
      name: 'Evil',
      brand_id: 1,
      category_id: 1,
      status: 'Live',
    } as never);
    expect(error).not.toBeNull();
  });

  it('Pintola products are not Live (brand exclusion pending)', async () => {
    const sb = createClient(url, anon);
    const { data } = await sb
      .from('products')
      .select('slug')
      .like('slug', 'pintola-%');
    expect(data!.length).toBe(0);
  });

  it('brands public-read shows non-excluded brands', async () => {
    const sb = createClient(url, anon);
    const { data, error } = await sb.from('brands').select('slug, is_excluded');
    expect(error).toBeNull();
    expect(data!.length).toBeGreaterThan(0);
    for (const b of data!) {
      expect(b.is_excluded).toBe(false);
    }
  });
});
