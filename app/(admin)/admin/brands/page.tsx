import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { updateBrandContactEmail } from "./_actions";

export const dynamic = "force-dynamic";

export default async function BrandsAdmin() {
  const admin = createAdminClient();
  const { data: brands, error } = await admin
    .from("brands")
    .select("id, name, slug, website_url, contact_email, is_excluded")
    .order("name");

  const withEmail = brands?.filter((b) => b.contact_email).length ?? 0;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="text-2xl font-bold">Brands</h1>
        <span className="text-xs uppercase tracking-wider text-stone-500">
          {withEmail}/{brands?.length ?? 0} with founder email
        </span>
      </div>
      <p className="mt-2 text-stone-600 text-sm">
        Founder contact per brand. When a product is pushed Live for the first
        time, an automatic &ldquo;your product is listed&rdquo; email goes to
        this address so they can share it. Brands without an email are simply
        skipped.
      </p>

      {error && (
        <p className="mt-6 text-sm text-red-700 bg-red-50 border border-red-200 p-3">
          Couldn&rsquo;t load: {error.message}
        </p>
      )}

      <ul className="mt-6 divide-y border bg-white">
        {brands?.map((b) => (
          <li key={b.id} className="p-4 flex flex-wrap items-center gap-3">
            <div className="min-w-[220px] flex-1">
              <span className="font-semibold">{b.name}</span>
              {b.is_excluded && (
                <span className="ml-2 px-2 py-0.5 bg-red-50 text-red-700 rounded uppercase tracking-wider text-[10px]">
                  excluded
                </span>
              )}
              {b.website_url && (
                <a
                  href={b.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-xs underline text-stone-500 hover:text-stone-800"
                >
                  site ↗
                </a>
              )}
            </div>
            <form
              action={updateBrandContactEmail}
              className="flex items-center gap-2"
            >
              <input type="hidden" name="brand_id" value={b.id} />
              <input
                type="email"
                name="contact_email"
                defaultValue={b.contact_email ?? ""}
                placeholder="founder@brand.com"
                className="border border-stone-300 px-3 py-1.5 text-sm w-64 bg-white focus:outline-none focus:border-stone-800"
              />
              <button
                type="submit"
                className="border border-stone-800 bg-stone-900 text-white px-3 py-1.5 text-xs uppercase tracking-wider hover:bg-stone-700"
              >
                Save
              </button>
            </form>
          </li>
        ))}
      </ul>

      <div className="mt-8">
        <Link
          href="/admin"
          className="text-xs uppercase tracking-wider text-stone-600 hover:text-stone-900 underline"
        >
          ← back to admin
        </Link>
      </div>
    </div>
  );
}
