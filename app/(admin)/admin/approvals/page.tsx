import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentAdminRole } from '@/lib/admin/roles';
import ApprovalCard from './_card';

export default async function ApprovalsQueuePage() {
  const { role } = await getCurrentAdminRole();
  const admin = createAdminClient();

  const { data: products, error } = await admin
    .from('products')
    .select(
      `id, slug, name, variant_size, ingredients_raw, primary_buy_url,
       product_photo_url, label_image_url, certification_method,
       prepared_at, review_notes,
       brand:brands(name, slug, is_excluded, exclusion_reason),
       category:categories(name, slug)`
    )
    .eq('status', 'PendingReview')
    .order('prepared_at', { ascending: true });

  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Approval queue</h1>
        <p className="mt-1 text-stone-600">
          {role === 'reviewer'
            ? 'Tap Approve / Ask / Reject on each card. Cleared cards disappear from the queue.'
            : 'Read-only view (preparer). Reviewer role required to approve.'}
        </p>
      </header>

      {error && <p className="text-red-600 text-sm mb-4">{error.message}</p>}

      {(!products || products.length === 0) && (
        <div className="bg-white border border-stone-200 p-8 text-center rounded">
          <p className="text-stone-600">No products awaiting review. Nice.</p>
          <Link href="/admin/products" className="mt-4 inline-block text-sm underline">
            View all products →
          </Link>
        </div>
      )}

      <div className="space-y-6">
        {products?.map((p) => {
          const brand = Array.isArray(p.brand) ? p.brand[0] : p.brand;
          const cat = Array.isArray(p.category) ? p.category[0] : p.category;
          return (
            <ApprovalCard
              key={p.id}
              productId={p.id}
              brand={brand?.name ?? '—'}
              brandExcluded={!!brand?.is_excluded}
              brandWarning={brand?.exclusion_reason ?? null}
              category={cat?.name ?? '—'}
              name={p.name}
              variant={p.variant_size}
              ingredients={p.ingredients_raw}
              productPhoto={p.product_photo_url}
              labelImage={p.label_image_url}
              buyUrl={p.primary_buy_url}
              cert={p.certification_method}
              preparedAt={p.prepared_at}
              priorNote={p.review_notes}
              canDecide={role === 'reviewer'}
            />
          );
        })}
      </div>
    </div>
  );
}
