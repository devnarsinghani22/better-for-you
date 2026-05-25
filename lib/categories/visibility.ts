// Categories have no "Draft" status — only an `active` boolean — and the
// homepage/category pages render active categories on BOTH prod and staging.
// To preview a not-yet-live category (and its products) on the staging URL
// WITHOUT it leaking onto foodpharmer.health, we insert it as active=false
// with a sentinel display_order >= STAGING_CATEGORY_ORDER_MIN. On preview we
// additionally surface those sentinel categories; on production only `active`
// ones show. This mirrors lib/products/visibility.ts.
//
// Retired/hidden categories (curd, rusks, soya-chunks, …) keep display_order
// well below the sentinel, so they never resurface on staging.
//
// Reads VERCEL_ENV (server-only, runtime, auto-set by Vercel: "production" for
// prod, "preview" for branch previews including staging, undefined locally).
export const STAGING_CATEGORY_ORDER_MIN = 900;

export function previewCategoriesEnabled(): boolean {
  return process.env.VERCEL_ENV !== 'production';
}

// PostgREST `.or()` filter string selecting visible categories for this env.
// Preview: active OR sentinel display_order. Production: active only.
export function visibleCategoryOrFilter(): string {
  return previewCategoriesEnabled()
    ? `active.eq.true,display_order.gte.${STAGING_CATEGORY_ORDER_MIN}`
    : 'active.eq.true';
}
