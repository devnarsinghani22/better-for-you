import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // Only the admin area is authenticated, so only it needs the Supabase
  // session-refresh middleware. Running this on every public request fired a
  // function invocation + a Supabase auth.getUser() call per page view (~23M/mo
  // of needless Function Invocations, Fluid CPU and Supabase auth load for
  // anonymous visitors hitting fully-cached ISR pages). Scope to /admin only.
  matcher: ['/admin/:path*'],
};
