// Returns the array of product statuses that should be visible to public visitors
// in this environment.
//
// Production (foodpharmer.health, master branch) → only "Live".
// Preview / staging / dev → "Live" + "Draft" so unapproved entries can be
// reviewed on the staging URL before merging to prod.
//
// Vercel auto-injects NEXT_PUBLIC_VERCEL_ENV: "production" on the production
// deploy, "preview" on branch previews (including staging), undefined locally.
export function visibleProductStatuses(): readonly string[] {
  return process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
    ? ['Live']
    : ['Live', 'Draft'];
}
