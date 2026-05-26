'use client';

import { useState, useTransition } from 'react';
import { approveProduct, askClarification, rejectProduct } from '@/lib/admin/workflow';

type Props = {
  productId: number;
  brand: string;
  brandExcluded: boolean;
  brandWarning: string | null;
  category: string;
  name: string;
  variant: string | null;
  ingredients: string | null;
  productPhoto: string | null;
  labelImage: string | null;
  buyUrl: string | null;
  cert: string;
  preparedAt: string | null;
  priorNote: string | null;
  canDecide: boolean;
};

export default function ApprovalCard(p: Props) {
  const [mode, setMode] = useState<null | 'ask' | 'reject'>(null);
  const [note, setNote] = useState('');
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showLabel, setShowLabel] = useState(false);

  const isLab = p.cert === 'lab_tested';
  const prepared = p.preparedAt ? new Date(p.preparedAt).toLocaleString('en-IN') : '—';

  function run(action: () => Promise<void>) {
    setError(null);
    startTransition(async () => {
      try {
        await action();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed');
      }
    });
  }

  return (
    <article className="bg-white border border-stone-200 rounded shadow-sm overflow-hidden">
      {p.brandExcluded && (
        <div className="bg-amber-50 border-b border-amber-200 px-5 py-3 text-xs text-amber-900">
          ⚠ <strong>Brand on watch list:</strong> {p.brandWarning}
        </div>
      )}

      <div className="p-5 sm:p-6">
        <div className="text-xs uppercase tracking-wider text-stone-500 mb-1">{p.brand} · {p.category}</div>
        <h2 className="text-2xl font-bold leading-tight">{p.name}</h2>
        {p.variant && <p className="text-sm text-stone-600 mt-1">{p.variant}</p>}

        {p.productPhoto && (
          <div className="mt-4 bg-stone-50 rounded overflow-hidden flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.productPhoto}
              alt={p.name}
              className="max-h-72 w-auto object-contain"
            />
          </div>
        )}

        <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
          <Fact label="Cert">{isLab ? 'Lab-tested ✓' : 'Label-tested'}</Fact>
          <Fact label="Prepared">{prepared}</Fact>
        </div>

        {p.ingredients && (
          <details className="mt-4 group">
            <summary className="cursor-pointer text-sm font-medium text-stone-700">
              Ingredients (verbatim)
            </summary>
            <p className="mt-2 text-sm text-stone-700 bg-stone-50 p-3 rounded font-mono">
              {p.ingredients}
            </p>
          </details>
        )}

        {p.labelImage && (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setShowLabel((v) => !v)}
              className="text-sm underline text-stone-700"
            >
              {showLabel ? 'Hide label image' : 'View label image'}
            </button>
            {showLabel && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.labelImage}
                alt={`${p.name} label`}
                className="mt-3 w-full rounded border"
              />
            )}
          </div>
        )}

        {p.buyUrl && (
          <a
            href={p.buyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block text-sm underline text-stone-700"
          >
            View source page ↗
          </a>
        )}

        {p.priorNote && (
          <div className="mt-4 bg-blue-50 border border-blue-200 p-3 rounded text-sm text-blue-900">
            <strong>Earlier note:</strong> {p.priorNote}
          </div>
        )}
      </div>

      {p.canDecide && (
        <div className="border-t border-stone-200 px-5 py-4 bg-stone-50">
          {mode === null && (
            <div className="grid grid-cols-3 gap-2">
              <button
                disabled={pending}
                onClick={() => run(() => approveProduct(p.productId))}
                className="bg-green-700 text-white py-3 rounded text-sm font-medium disabled:opacity-50 hover:bg-green-800"
              >
                ✓ Approve
              </button>
              <button
                disabled={pending}
                onClick={() => setMode('ask')}
                className="bg-amber-500 text-white py-3 rounded text-sm font-medium disabled:opacity-50 hover:bg-amber-600"
              >
                ? Ask
              </button>
              <button
                disabled={pending}
                onClick={() => setMode('reject')}
                className="bg-red-700 text-white py-3 rounded text-sm font-medium disabled:opacity-50 hover:bg-red-800"
              >
                ✗ Reject
              </button>
            </div>
          )}

          {mode !== null && (
            <div>
              <label className="block text-sm font-medium mb-2">
                {mode === 'ask' ? 'What needs clarifying?' : 'Why are you rejecting?'}
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder={mode === 'ask' ? 'e.g., Is the source URL Amazon or brand site?' : 'e.g., Contains permitted color INS 100 — fails artificial-color rule.'}
              />
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  disabled={pending || note.trim().length < 4}
                  onClick={() =>
                    run(() =>
                      mode === 'ask'
                        ? askClarification(p.productId, note)
                        : rejectProduct(p.productId, note)
                    )
                  }
                  className={`${mode === 'ask' ? 'bg-amber-600' : 'bg-red-700'} text-white py-3 rounded text-sm disabled:opacity-50`}
                >
                  Send {mode === 'ask' ? 'question' : 'rejection'}
                </button>
                <button
                  onClick={() => {
                    setMode(null);
                    setNote('');
                  }}
                  className="border py-3 rounded text-sm bg-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
        </div>
      )}
    </article>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="uppercase tracking-wider text-stone-500 text-[10px]">{label}</div>
      <div className="text-stone-900 mt-0.5">{children}</div>
    </div>
  );
}
