import { createAdminClient } from '@/lib/supabase/admin';
import { createClient as createServerClient } from '@/lib/supabase/server';

export type AdminRole = 'preparer' | 'reviewer';

export async function getCurrentAdminRole(): Promise<{
  email: string | null;
  role: AdminRole | null;
}> {
  const sb = await createServerClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user?.email) return { email: null, role: null };

  // Use service-role client because admin_users RLS is locked down
  const admin = createAdminClient();
  const { data } = await admin
    .from('admin_users')
    .select('role')
    .eq('email', user.email)
    .maybeSingle();

  return { email: user.email, role: (data?.role as AdminRole | null) ?? null };
}

export async function requireRole(roles: AdminRole[] = ['preparer', 'reviewer']) {
  const { email, role } = await getCurrentAdminRole();
  if (!email || !role || !roles.includes(role)) {
    throw new Error('Forbidden: admin role required');
  }
  return { email, role };
}
