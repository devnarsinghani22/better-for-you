import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/admin');

  // Allowlist check via service-role client
  const admin = createAdminClient();
  const { data: row } = await admin
    .from('admin_users')
    .select('role, full_name')
    .eq('email', user.email!)
    .maybeSingle();

  const role = row?.role as 'preparer' | 'reviewer' | undefined;

  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-stone-50">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold mb-3">Access denied</h1>
          <p className="text-stone-600 mb-6">
            <span className="font-mono text-sm">{user.email}</span> is not on the admin allowlist for Food Pharmer Approved.
          </p>
          <form action="/auth/signout" method="post">
            <button className="text-sm underline text-stone-700">Sign out and try another account</button>
          </form>
        </div>
      </div>
    );
  }

  const navItems =
    role === 'reviewer'
      ? [
          { href: '/admin/approvals', label: 'Approvals' },
          { href: '/admin/products', label: 'All products' },
        ]
      : [
          { href: '/admin/products', label: 'Products' },
          { href: '/admin/approvals', label: 'Approvals' },
        ];

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="border-b bg-white px-6 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="font-semibold">FP Admin</Link>
          <nav className="hidden sm:flex gap-4 text-sm">
            {navItems.map((it) => (
              <Link key={it.href} href={it.href} className="text-stone-600 hover:text-stone-900">
                {it.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="text-sm flex items-center gap-4">
          <span className="hidden sm:inline text-stone-600 text-xs">
            {row?.full_name ?? user.email}
            <span className="ml-2 px-2 py-0.5 bg-stone-100 rounded text-stone-700 uppercase tracking-wider text-[10px]">
              {role}
            </span>
          </span>
          <form action="/auth/signout" method="post">
            <button className="underline text-stone-700">Sign out</button>
          </form>
        </div>
      </header>
      <main className="p-6 max-w-6xl mx-auto">{children}</main>
    </div>
  );
}
