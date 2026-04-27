'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    });
    if (error) setErr(error.message);
    else setSent(true);
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold">Admin login</h1>
        {sent ? (
          <p className="text-green-700">Check your inbox for a magic link.</p>
        ) : (
          <>
            <input
              type="email"
              required
              placeholder="you@onlywhatsneeded.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
            <button
              type="submit"
              className="w-full bg-black text-white rounded py-2"
            >
              Send magic link
            </button>
            {err && <p className="text-red-600 text-sm">{err}</p>}
          </>
        )}
      </form>
    </main>
  );
}
