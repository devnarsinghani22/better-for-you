// A short, personal note from Revant shown under a category's criteria.
// Handwriting face (--font-hand) + a faint tilt make it read as a margin note,
// not site copy. Renders nothing when a category has no note.
export default function CuratorNote({ note }: { note: string | null }) {
  if (!note || !note.trim()) return null;
  return (
    <aside className="mt-6">
      <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-[color:var(--ink-mute)] mb-3">
        A note from Revant
      </div>
      <div className="relative bg-[color:var(--bg-elev)] border rule rounded-sm px-6 py-6 sm:px-8 sm:py-7 -rotate-[0.4deg]">
        <p className="font-hand text-[26px] sm:text-[30px] leading-[1.3] text-[color:var(--ink)]">
          {note}
        </p>
        <p className="font-hand text-3xl sm:text-4xl mt-3 text-right text-[color:var(--ink)]">
          &mdash; Revant
        </p>
      </div>
    </aside>
  );
}
