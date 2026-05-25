// Returns the array of product statuses that should be visible to public visitors
// in this environment.
//
// Production (foodpharmer.health, master branch) → only "Live".
// Preview / staging / dev → "Live" + "Draft" so unapproved entries can be
// reviewed on the staging URL before merging to prod.
//
// Reads VERCEL_ENV (server-only, runtime read, auto-set by Vercel: "production"
// for prod, "preview" for branch previews including staging, undefined locally).
export function visibleProductStatuses(): readonly string[] {
  return process.env.VERCEL_ENV === 'production'
    ? ['Live']
    : ['Live', 'Draft'];
}
