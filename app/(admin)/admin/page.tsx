import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export default async function AdminHome() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  const admin = createAdminClient();

  const counts = await Promise.all(
    ['Live', 'PendingReview', 'NeedsClarification', 'Draft'].map(async (s) => {
      const { count } = await admin
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('status', s as never);
      return { status: s, count: count ?? 0 };
    })
  );

  return (
    <div>
      <h1 className="text-2xl font-bold">Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}.</h1>
      <p className="mt-2 text-stone-600">Here&rsquo;s what&rsquo;s in flight.</p>

      <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {counts.map((c) => (
          <Link
            key={c.status}
            href={c.status === 'PendingReview' ? '/admin/approvals' : `/admin/products?status=${c.status}`}
            className="bg-white border p-5 rounded hover:border-stone-400 transition-colors block"
          >
            <div className="text-3xl font-bold">{c.count}</div>
            <div className="text-xs uppercase tracking-wider text-stone-500 mt-1">{c.status}</div>
          </Link>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/admin/products/new" className="bg-black text-white px-4 py-2 text-sm">+ New product</Link>
        <Link href="/admin/products" className="border px-4 py-2 text-sm bg-white">View all products</Link>
        <Link href="/admin/approvals" className="border px-4 py-2 text-sm bg-white">Approval queue</Link>
        <Link href="/admin/contact" className="border px-4 py-2 text-sm bg-white">Contact inbox</Link>
        <Link href="/admin/brands" className="border px-4 py-2 text-sm bg-white">Brands</Link>
      </div>
    </div>
  );
}
