'use client';

import { useState, useTransition } from 'react';
import {
  submitForReview,
  pushLive,
  retractProduct,
} from '@/lib/admin/workflow';

type Props = {
  productId: number;
  status: string;
  role: 'preparer' | 'reviewer' | null;
};

export default function WorkflowActions({ productId, status, role }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [retractOpen, setRetractOpen] = useState(false);
  const [reason, setReason] = useState('');

  function run(fn: () => Promise<void>) {
    setError(null);
    startTransition(async () => {
      try {
        await fn();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed');
      }
    });
  }

  const isPreparer = role === 'preparer';

  return (
    <div className="bg-stone-50 border rounded p-4">
      <div className="text-xs uppercase tracking-wider text-stone-500 mb-3">Workflow</div>
      <div className="flex flex-wrap gap-2">
        {(status === 'Draft' || status === 'NeedsClarification') && isPreparer && (
          <button
            disabled={pending}
            onClick={() => run(() => submitForReview(productId))}
            className="bg-amber-500 text-white px-4 py-2 text-sm rounded hover:bg-amber-600 disabled:opacity-50"
          >
            Submit to Revant for review →
          </button>
        )}

        {status === 'Approved' && (
          <button
            disabled={pending}
            onClick={() => run(() => pushLive(productId))}
            className="bg-green-700 text-white px-4 py-2 text-sm rounded hover:bg-green-800 disabled:opacity-50"
          >
            Push Live (publish to website) →
          </button>
        )}

        {status === 'Live' && (
          <>
            {!retractOpen ? (
              <button
                onClick={() => setRetractOpen(true)}
                className="border border-red-300 text-red-700 px-4 py-2 text-sm rounded hover:bg-red-50"
              >
                Retract from public site
              </button>
            ) : (
              <div className="w-full">
                <label className="block text-sm font-medium mb-1.5">
                  Reason for retraction (will be logged to audit_log):
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={2}
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="e.g., Brand reformulated; sugar now exceeds threshold"
                />
                <div className="mt-2 flex gap-2">
                  <button
                    disabled={pending || reason.trim().length < 4}
                    onClick={() => run(() => retractProduct(productId, reason))}
                    className="bg-red-700 text-white px-4 py-2 text-sm rounded disabled:opacity-50"
                  >
                    Confirm retract
                  </button>
                  <button
                    onClick={() => {
                      setRetractOpen(false);
                      setReason('');
                    }}
                    className="border px-4 py-2 text-sm rounded bg-white"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {status === 'PendingReview' && (
          <p className="text-sm text-stone-600">
            Awaiting reviewer. {role === 'reviewer' ? 'Decide in /admin/approvals.' : null}
          </p>
        )}

        {status === 'Rejected' && (
          <p className="text-sm text-stone-600">
            This product was rejected. Editing will not change that — create a new draft instead if needed.
          </p>
        )}

        {status === 'Retracted' && (
          <p className="text-sm text-stone-600">
            This product has been retracted from the public site. Audit trail preserved.
          </p>
        )}
      </div>
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
    </div>
  );
}
