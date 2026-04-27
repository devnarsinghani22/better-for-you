import { createClient } from '@/lib/supabase/server';
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

  return (
    <div className="min-h-screen">
      <header className="border-b px-6 py-3 flex items-center justify-between">
        <Link href="/admin" className="font-semibold">
          FP Admin
        </Link>
        <div className="text-sm flex items-center gap-4">
          <span className="text-gray-600">{user.email}</span>
          <form action="/auth/signout" method="post">
            <button className="underline">Sign out</button>
          </form>
        </div>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
