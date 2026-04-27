import Link from 'next/link';
import { notFound } from 'next/navigation';
import ProductForm from '../_form';
import { updateProduct } from '../_actions';
import { createClient } from '@/lib/supabase/server';

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numId = Number(id);
  if (Number.isNaN(numId)) notFound();

  const sb = await createClient();
  const { data: product } = await sb
    .from('products')
    .select(
      `id, slug, name, brand_id, category_id, variant_size, status,
       certification_method, rating, ingredients_raw, primary_buy_url,
       product_photo_url, label_image_url, last_verified_at`
    )
    .eq('id', numId)
    .single();

  if (!product) notFound();

  const action = updateProduct.bind(null, numId);

  return (
    <div>
      <Link href="/admin/products" className="text-sm underline text-stone-600">
        ← All products
      </Link>
      <h1 className="text-2xl font-bold mt-4">{product.name}</h1>
      <p className="text-sm text-stone-500 mb-6 font-mono">{product.slug}</p>
      <ProductForm product={product} action={action} />
    </div>
  );
}
