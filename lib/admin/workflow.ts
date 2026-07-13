'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireRole } from '@/lib/admin/roles';
import { sendProductLiveEmail } from '@/lib/email/mailer';

type Status =
  | 'Draft'
  | 'PendingReview'
  | 'NeedsClarification'
  | 'Vetted'
  | 'Rejected'
  | 'Live'
  | 'Retracted';

async function logTransition(args: {
  productId: number;
  actorUserId: string;
  actorEmail: string;
  action: string;
  fromStatus: Status | null;
  toStatus: Status;
  note?: string | null;
}) {
  const admin = createAdminClient();
  await admin.from('audit_log').insert({
    product_id: args.productId,
    actor_user_id: args.actorUserId,
    actor_email: args.actorEmail,
    action: args.action,
    from_status: args.fromStatus,
    to_status: args.toStatus,
    note: args.note ?? null,
  });
}

async function getProductStatus(id: number): Promise<Status | null> {
  const admin = createAdminClient();
  const { data } = await admin.from('products').select('status').eq('id', id).single();
  return (data?.status as Status) ?? null;
}

async function userInfo() {
  const { email, role } = await requireRole(['preparer', 'reviewer']);
  // Get auth user id via the admin client + email lookup
  const admin = createAdminClient();
  const { data } = await admin.auth.admin.listUsers();
  const u = data.users.find((u) => u.email?.toLowerCase() === email!.toLowerCase());
  return { email: email!, userId: u?.id ?? '00000000-0000-0000-0000-000000000000', role };
}

export async function submitForReview(productId: number) {
  const { email, userId, role } = await userInfo();
  if (role !== 'preparer') throw new Error('Only preparers can submit for review');

  const from = await getProductStatus(productId);
  if (from !== 'Draft' && from !== 'NeedsClarification') {
    throw new Error(`Cannot submit from status ${from}`);
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from('products')
    .update({ status: 'PendingReview', prepared_at: new Date().toISOString(), prepared_by: userId })
    .eq('id', productId);
  if (error) throw new Error(error.message);

  await logTransition({
    productId,
    actorUserId: userId,
    actorEmail: email,
    action: 'submit',
    fromStatus: from,
    toStatus: 'PendingReview',
  });
  revalidatePath('/admin/products');
  revalidatePath('/admin/approvals');
  revalidatePath(`/admin/products/${productId}`);
}

export async function approveProduct(productId: number, note?: string | null) {
  const { email, userId, role } = await userInfo();
  if (role !== 'reviewer') throw new Error('Only reviewers can approve');

  const from = await getProductStatus(productId);
  if (from !== 'PendingReview') throw new Error(`Cannot approve from status ${from}`);

  const admin = createAdminClient();
  const { error } = await admin
    .from('products')
    .update({
      status: 'Vetted',
      reviewed_at: new Date().toISOString(),
      reviewed_by: userId,
      review_notes: note ?? null,
    })
    .eq('id', productId);
  if (error) throw new Error(error.message);

  await logTransition({
    productId,
    actorUserId: userId,
    actorEmail: email,
    action: 'approve',
    fromStatus: from,
    toStatus: 'Vetted',
    note,
  });
  revalidatePath('/admin/products');
  revalidatePath('/admin/approvals');
}

export async function rejectProduct(productId: number, note: string) {
  const { email, userId, role } = await userInfo();
  if (role !== 'reviewer') throw new Error('Only reviewers can reject');
  if (!note || note.trim().length < 4) throw new Error('Rejection note required');

  const from = await getProductStatus(productId);
  if (from !== 'PendingReview') throw new Error(`Cannot reject from status ${from}`);

  const admin = createAdminClient();
  const { error } = await admin
    .from('products')
    .update({
      status: 'Rejected',
      reviewed_at: new Date().toISOString(),
      reviewed_by: userId,
      review_notes: note,
    })
    .eq('id', productId);
  if (error) throw new Error(error.message);

  await logTransition({
    productId,
    actorUserId: userId,
    actorEmail: email,
    action: 'reject',
    fromStatus: from,
    toStatus: 'Rejected',
    note,
  });
  revalidatePath('/admin/products');
  revalidatePath('/admin/approvals');
}

export async function askClarification(productId: number, note: string) {
  const { email, userId, role } = await userInfo();
  if (role !== 'reviewer') throw new Error('Only reviewers can ask for clarification');
  if (!note || note.trim().length < 4) throw new Error('Clarification note required');

  const from = await getProductStatus(productId);
  if (from !== 'PendingReview') throw new Error(`Cannot ask from status ${from}`);

  const admin = createAdminClient();
  const { error } = await admin
    .from('products')
    .update({
      status: 'NeedsClarification',
      review_notes: note,
    })
    .eq('id', productId);
  if (error) throw new Error(error.message);

  await logTransition({
    productId,
    actorUserId: userId,
    actorEmail: email,
    action: 'ask',
    fromStatus: from,
    toStatus: 'NeedsClarification',
    note,
  });
  revalidatePath('/admin/products');
  revalidatePath('/admin/approvals');
}

// Lets the brand's founder know their product just went Live so they can
// share it. Best-effort only: any failure is logged and never blocks pushLive.
// Skipped on re-listings (a prior push_live audit row already congratulated).
async function notifyFounderProductLive(productId: number, isFirstPushLive: boolean) {
  try {
    if (!isFirstPushLive) return;
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('products')
      .select('name, slug, brand:brands(name, contact_email), category:categories(slug)')
      .eq('id', productId)
      .single();
    if (error || !data) {
      console.error('[founder-notify] product fetch failed:', error?.message);
      return;
    }
    const brand = Array.isArray(data.brand) ? data.brand[0] : data.brand;
    const category = Array.isArray(data.category) ? data.category[0] : data.category;
    if (!brand?.contact_email || !category?.slug) return;

    await sendProductLiveEmail({
      to: brand.contact_email,
      brandName: brand.name,
      productName: data.name,
      productUrl: `https://foodpharmer.health/c/${category.slug}/${data.slug}`,
    });
  } catch (e) {
    console.error('[founder-notify] send failed:', e instanceof Error ? e.message : e);
  }
}

export async function pushLive(productId: number) {
  const { email, userId } = await userInfo();
  const from = await getProductStatus(productId);
  if (from !== 'Vetted') throw new Error(`Cannot push live from status ${from}`);

  const now = new Date();
  const sixMonthsLater = new Date(now);
  sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);

  const admin = createAdminClient();

  // First listing vs re-listing after retraction: only the first gets the
  // founder congrats email. Checked before we write this push's audit row.
  const { count: priorPushes } = await admin
    .from('audit_log')
    .select('id', { count: 'exact', head: true })
    .eq('product_id', productId)
    .eq('action', 'push_live');

  const { error } = await admin
    .from('products')
    .update({
      status: 'Live',
      last_verified_at: now.toISOString(),
      reverify_due_at: sixMonthsLater.toISOString(),
    })
    .eq('id', productId);
  if (error) throw new Error(error.message);

  await logTransition({
    productId,
    actorUserId: userId,
    actorEmail: email,
    action: 'push_live',
    fromStatus: from,
    toStatus: 'Live',
  });

  await notifyFounderProductLive(productId, (priorPushes ?? 0) === 0);

  revalidatePath('/admin/products');
  revalidatePath('/');
  revalidatePath(`/admin/products/${productId}`);
}

export async function retractProduct(productId: number, reason: string) {
  const { email, userId } = await userInfo();
  if (!reason || reason.trim().length < 4) throw new Error('Retraction reason required');

  const from = await getProductStatus(productId);
  if (from !== 'Live') throw new Error(`Cannot retract from status ${from}`);

  const admin = createAdminClient();
  const { error } = await admin
    .from('products')
    .update({
      status: 'Retracted',
      retracted_at: new Date().toISOString(),
      retraction_reason: reason,
    })
    .eq('id', productId);
  if (error) throw new Error(error.message);

  await logTransition({
    productId,
    actorUserId: userId,
    actorEmail: email,
    action: 'retract',
    fromStatus: from,
    toStatus: 'Retracted',
    note: reason,
  });
  revalidatePath('/admin/products');
  revalidatePath('/');
}
