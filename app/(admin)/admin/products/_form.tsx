import { createClient } from '@/lib/supabase/server';
import { deleteProduct } from './_actions';

type ProductForForm = {
  id?: number;
  slug?: string | null;
  name?: string | null;
  brand_id?: number | null;
  category_id?: number | null;
  variant_size?: string | null;
  status?: string | null;
  certification_method?: string | null;
  rating?: string | null;
  ingredients_raw?: string | null;
  primary_buy_url?: string | null;
  product_photo_url?: string | null;
  label_image_url?: string | null;
  last_verified_at?: string | null;
};

export default async function ProductForm({
  product,
  action,
}: {
  product?: ProductForForm;
  action: (formData: FormData) => void;
}) {
  const sb = await createClient();
  const { data: brands } = await sb.from('brands').select('id, name, is_excluded').order('name');
  const { data: categories } = await sb.from('categories').select('id, name').order('display_order');

  const lastVerifiedISO = product?.last_verified_at
    ? new Date(product.last_verified_at).toISOString().slice(0, 16)
    : '';

  return (
    <form action={action} className="space-y-5 max-w-2xl">
      <Field label="Slug (URL handle)" hint="lowercase, dashes only — e.g. amul-fresh-paneer">
        <input
          name="slug"
          required
          defaultValue={product?.slug ?? ''}
          pattern="[a-z0-9-]+"
          className="w-full border rounded px-3 py-2 font-mono text-sm"
        />
      </Field>

      <Field label="Name">
        <input
          name="name"
          required
          defaultValue={product?.name ?? ''}
          className="w-full border rounded px-3 py-2"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Brand">
          <select
            name="brand_id"
            required
            defaultValue={product?.brand_id ?? ''}
            className="w-full border rounded px-3 py-2 bg-white"
          >
            <option value="" disabled>—</option>
            {brands?.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
                {b.is_excluded ? ' (excluded)' : ''}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Category">
          <select
            name="category_id"
            required
            defaultValue={product?.category_id ?? ''}
            className="w-full border rounded px-3 py-2 bg-white"
          >
            <option value="" disabled>—</option>
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Variant size" hint="500g, 1kg, 200ml — optional">
        <input
          name="variant_size"
          defaultValue={product?.variant_size ?? ''}
          className="w-full border rounded px-3 py-2"
        />
      </Field>

      <div className="grid grid-cols-3 gap-4">
        <Field label="Status">
          <select
            name="status"
            required
            defaultValue={product?.status ?? 'Draft'}
            className="w-full border rounded px-3 py-2 bg-white"
          >
            {['Draft', 'PendingReview', 'NeedsClarification', 'Approved', 'Live', 'Rejected', 'Retracted'].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </Field>

        <Field label="Certification">
          <select
            name="certification_method"
            required
            defaultValue={product?.certification_method ?? 'label_tested'}
            className="w-full border rounded px-3 py-2 bg-white"
          >
            <option value="label_tested">Label-tested</option>
            <option value="lab_tested">Lab-tested</option>
            <option value="both">Both</option>
          </select>
        </Field>

        <Field label="Rating">
          <select
            name="rating"
            defaultValue={product?.rating ?? ''}
            className="w-full border rounded px-3 py-2 bg-white"
          >
            <option value="">—</option>
            {['A+', 'A', 'B+', 'B', 'C', 'D'].map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Ingredients (verbatim from label)">
        <textarea
          name="ingredients_raw"
          rows={4}
          defaultValue={product?.ingredients_raw ?? ''}
          className="w-full border rounded px-3 py-2 font-mono text-sm"
        />
      </Field>

      <Field label="Primary buy URL" hint="Amazon / Blinkit / Zepto / brand site">
        <input
          name="primary_buy_url"
          type="url"
          defaultValue={product?.primary_buy_url ?? ''}
          className="w-full border rounded px-3 py-2 text-sm"
        />
      </Field>

      <Field label="Product photo URL">
        <input
          name="product_photo_url"
          type="url"
          defaultValue={product?.product_photo_url ?? ''}
          className="w-full border rounded px-3 py-2 text-sm"
        />
      </Field>

      <Field label="Label image URL" hint="Crop of the nutrition / ingredients label">
        <input
          name="label_image_url"
          type="url"
          defaultValue={product?.label_image_url ?? ''}
          className="w-full border rounded px-3 py-2 text-sm"
        />
      </Field>

      <Field label="Last verified">
        <input
          name="last_verified_at"
          type="datetime-local"
          defaultValue={lastVerifiedISO}
          className="w-full border rounded px-3 py-2 text-sm"
        />
      </Field>

      <div className="pt-4 border-t flex items-center gap-3">
        <button type="submit" className="bg-black text-white px-6 py-2 text-sm">
          {product?.id ? 'Save changes' : 'Create product'}
        </button>
        {product?.id && (
          <DeleteButton id={product.id} />
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-stone-800">{label}</span>
      {hint && <span className="block text-xs text-stone-500 mt-0.5">{hint}</span>}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function DeleteButton({ id }: { id: number }) {
  const action = deleteProduct.bind(null, id);
  return (
    <form action={action}>
      <button
        type="submit"
        className="text-sm text-red-700 underline hover:text-red-900"
      >
        Delete
      </button>
    </form>
  );
}
