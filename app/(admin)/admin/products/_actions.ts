'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

async function requireAdmin() {
  const sb = await createServerClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  return user;
}

type ProductPayload = {
  slug: string;
  name: string;
  brand_id: number;
  category_id: number;
  variant_size: string | null;
  status: 'Draft' | 'PendingReview' | 'NeedsClarification' | 'Approved' | 'Rejected' | 'Live' | 'Retracted';
  certification_method: 'label_tested' | 'lab_tested' | 'both';
  rating: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' | null;
  ingredients_raw: string | null;
  primary_buy_url: string | null;
  product_photo_url: string | null;
  label_image_url: string | null;
  last_verified_at: string | null;
  prepared_by?: string;
  prepared_at?: string;
};

function formToPayload(fd: FormData, preparedBy?: string): ProductPayload {
  const get = (k: string): string | null => {
    const v = fd.get(k);
    return v === null || v === '' ? null : String(v);
  };
  const num = (k: string): number => {
    const v = get(k);
    if (v === null) throw new Error(`${k} is required`);
    return Number(v);
  };
  const required = (k: string): string => {
    const v = get(k);
    if (v === null) throw new Error(`${k} is required`);
    return v;
  };

  const base: ProductPayload = {
    slug: required('slug'),
    name: required('name'),
    brand_id: num('brand_id'),
    category_id: num('category_id'),
    variant_size: get('variant_size'),
    status: required('status') as ProductPayload['status'],
    certification_method: required('certification_method') as ProductPayload['certification_method'],
    rating: (get('rating') as ProductPayload['rating']) ?? null,
    ingredients_raw: get('ingredients_raw'),
    primary_buy_url: get('primary_buy_url'),
    product_photo_url: get('product_photo_url'),
    label_image_url: get('label_image_url'),
    last_verified_at: get('last_verified_at'),
  };

  if (preparedBy) {
    base.prepared_by = preparedBy;
    base.prepared_at = new Date().toISOString();
  }
  return base;
}

export async function createProduct(formData: FormData) {
  const user = await requireAdmin();
  const admin = createAdminClient();
  const payload = formToPayload(formData, user.id);
  const { data, error } = await admin
    .from('products')
    .insert(payload)
    .select('id')
    .single();
  if (error) throw new Error(error.message);
  revalidatePath('/admin/products');
  revalidatePath('/');
  redirect(`/admin/products/${data.id}`);
}

export async function updateProduct(id: number, formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();
  const payload = formToPayload(formData);
  const { error } = await admin.from('products').update(payload).eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/products');
  revalidatePath(`/admin/products/${id}`);
  revalidatePath('/');
}

export async function deleteProduct(id: number) {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from('products').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/products');
  revalidatePath('/');
  redirect('/admin/products');
}
