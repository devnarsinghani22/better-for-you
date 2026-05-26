import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

type SP = { category?: string; status?: string };

const STATUSES = [
  'Draft',
  'PendingReview',
  'Vetted',
  'Live',
  'Rejected',
  'Retracted',
] as const;

export default async function AdminProductsList({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const sb = await createClient();
  let q = sb
    .from('products')
    .select(
      `id, slug, name, status, certification_method, updated_at,
       brand:brands(name, slug),
       category:categories(name, slug)`
    )
    .order('updated_at', { ascending: false });

  if (sp.status) q = q.eq('status', sp.status as never);

  const { data: products, error } = await q;
  const filtered = sp.category
    ? (products ?? []).filter((p) => {
        const c = Array.isArray(p.category) ? p.category[0] : p.category;
        return c?.slug === sp.category;
      })
    : products ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Products ({filtered.length})</h1>
        <Link
          href="/admin/products/new"
          className="bg-black text-white px-4 py-2 text-sm hover:bg-stone-700"
        >
          + New product
        </Link>
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error.message}</p>}

      <div className="mb-4 flex gap-3 text-xs">
        <Link
          href="/admin/products"
          className={!sp.status ? 'underline font-bold' : 'underline text-stone-600'}
        >
          all
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/products?status=${s}`}
            className={
              sp.status === s ? 'underline font-bold' : 'underline text-stone-600'
            }
          >
            {s}
          </Link>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-stone-500 border-b">
            <tr>
              <th className="py-2 pr-4">Product</th>
              <th className="pr-4">Brand</th>
              <th className="pr-4">Category</th>
              <th className="pr-4">Status</th>
              <th className="pr-4">Cert</th>
              <th className="pr-4">Updated</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const b = Array.isArray(p.brand) ? p.brand[0] : p.brand;
              const c = Array.isArray(p.category) ? p.category[0] : p.category;
              return (
                <tr key={p.id} className="border-b hover:bg-stone-50">
                  <td className="py-2 pr-4 font-medium">{p.name}</td>
                  <td className="pr-4 text-stone-600">{b?.name}</td>
                  <td className="pr-4 text-stone-600">{c?.name}</td>
                  <td className="pr-4"><StatusPill status={p.status} /></td>
                  <td className="pr-4 text-xs">{p.certification_method.replace('_', ' ')}</td>
                  <td className="pr-4 text-xs text-stone-500">
                    {new Date(p.updated_at).toLocaleDateString()}
                  </td>
                  <td>
                    <Link href={`/admin/products/${p.id}`} className="underline">edit</Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const tone =
    status === 'Live'
      ? 'bg-green-100 text-green-800'
      : status === 'Vetted'
      ? 'bg-blue-100 text-blue-800'
      : status === 'PendingReview'
      ? 'bg-amber-100 text-amber-800'
      : status === 'Rejected' || status === 'Retracted'
      ? 'bg-red-100 text-red-800'
      : 'bg-stone-100 text-stone-800';
  return <span className={`px-2 py-0.5 text-xs ${tone}`}>{status}</span>;
}
