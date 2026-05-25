import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// On preview deploys (staging branch), use the service-role key so reads can
// surface Draft products gated by RLS. The application-level visibility helper
// (lib/products/visibility.ts) still restricts what gets rendered. The service
// key stays server-only — Next.js never ships it to the browser because the var
// has no NEXT_PUBLIC_ prefix.
export async function createClient() {
  const cookieStore = await cookies();
  const isPreview = process.env.VERCEL_ENV !== 'production';
  const key = isPreview && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? process.env.SUPABASE_SERVICE_ROLE_KEY
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component — ignore; middleware handles refresh.
          }
        },
      },
    }
  );
}
