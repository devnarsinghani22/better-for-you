import Link from 'next/link';
import ProductForm from '../_form';
import { createProduct } from '../_actions';

export default function NewProductPage() {
  return (
    <div>
      <Link href="/admin/products" className="text-sm underline text-stone-600">
        ← All products
      </Link>
      <h1 className="text-2xl font-bold mt-4 mb-6">New product</h1>
      <ProductForm action={createProduct} />
    </div>
  );
}
