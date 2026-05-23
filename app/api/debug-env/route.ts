import { NextResponse } from 'next/server';
import { visibleProductStatuses } from '@/lib/products/visibility';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    VERCEL_ENV: process.env.VERCEL_ENV ?? null,
    NEXT_PUBLIC_VERCEL_ENV: process.env.NEXT_PUBLIC_VERCEL_ENV ?? null,
    NODE_ENV: process.env.NODE_ENV ?? null,
    VERCEL: process.env.VERCEL ?? null,
    VERCEL_GIT_COMMIT_REF: process.env.VERCEL_GIT_COMMIT_REF ?? null,
    visibility_returns: visibleProductStatuses(),
  });
}
