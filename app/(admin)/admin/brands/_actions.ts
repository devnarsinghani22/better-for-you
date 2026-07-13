'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireRole } from '@/lib/admin/roles';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Only touches contact_email: the founder-notification address. Empty input
// clears it (no email is sent for brands without one).
export async function updateBrandContactEmail(formData: FormData) {
  await requireRole(['preparer', 'reviewer']);

  const brandId = Number(formData.get('brand_id'));
  const raw = String(formData.get('contact_email') ?? '').trim();
  if (!Number.isFinite(brandId)) throw new Error('Missing brand');
  if (raw && !EMAIL_RE.test(raw)) throw new Error('That does not look like an email address');

  const admin = createAdminClient();
  const { error } = await admin
    .from('brands')
    .update({ contact_email: raw || null })
    .eq('id', brandId);
  if (error) throw new Error(error.message);

  revalidatePath('/admin/brands');
}
