import Link from 'next/link';
import { notFound } from 'next/navigation';
import ProductForm from '../_form';
import { updateProduct } from '../_actions';
import WorkflowActions from './_workflow';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentAdminRole } from '@/lib/admin/roles';

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numId = Number(id);
  if (Number.isNaN(numId)) notFound();

  const admin = createAdminClient();
  const { data: product } = await admin
    .from('products')
    .select(
      `id, slug, name, brand_id, category_id, variant_size, status,
       certification_method, ingredients_raw, primary_buy_url,
       product_photo_url, label_image_url, last_verified_at, review_notes`
    )
    .eq('id', numId)
    .single();

  if (!product) notFound();

  const action = updateProduct.bind(null, numId);
  const { role } = await getCurrentAdminRole();

  return (
    <div>
      <Link href="/admin/products" className="text-sm underline text-stone-600">
        ← All products
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <p className="text-sm text-stone-500 font-mono">{product.slug}</p>
        </div>
        <span
          className={`px-3 py-1 text-xs uppercase tracking-wider rounded ${
            product.status === 'Live'
              ? 'bg-green-100 text-green-800'
              : product.status === 'Vetted'
              ? 'bg-blue-100 text-blue-800'
              : product.status === 'PendingReview'
              ? 'bg-amber-100 text-amber-800'
              : product.status === 'NeedsClarification'
              ? 'bg-orange-100 text-orange-800'
              : product.status === 'Rejected' || product.status === 'Retracted'
              ? 'bg-red-100 text-red-800'
              : 'bg-stone-100 text-stone-800'
          }`}
        >
          {product.status}
        </span>
      </div>

      {product.review_notes && (
        <div className="mb-6 bg-blue-50 border border-blue-200 p-3 rounded text-sm">
          <strong>Review notes:</strong> {product.review_notes}
        </div>
      )}

      <WorkflowActions productId={numId} status={product.status} role={role ?? null} />

      <h2 className="mt-10 mb-3 text-sm uppercase tracking-wider text-stone-500">Edit fields</h2>
      <ProductForm product={product} action={action} />
    </div>
  );
}
