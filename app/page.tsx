import { createClient } from '@/lib/supabase/server';

export const revalidate = 60; // ISR — re-fetch at most every 60s

export default async function HomePage() {
  const supabase = await createClient();
  const { data: categories, error } = await supabase
    .from('categories')
    .select('id, slug, name, blurb')
    .eq('active', true)
    .order('display_order', { ascending: true });

  if (error) {
    return <main className="p-8">Error loading: {error.message}</main>;
  }

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold">Food Pharmer Approved</h1>
      <p className="mt-2 text-gray-600">
        Products Food Pharmer would actually buy.
      </p>

      <section className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories?.map((c) => (
          <article
            key={c.id}
            className="border rounded-lg p-5 hover:shadow-md transition"
          >
            <h2 className="text-xl font-semibold">{c.name}</h2>
            <p className="mt-2 text-sm text-gray-600">{c.blurb}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
