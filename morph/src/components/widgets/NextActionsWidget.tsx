"use client";

export default function NextActionsWidget({ w }: { w: any }) {
  const items: string[] = Array.isArray(w.data?.items) ? w.data.items : [];
  const title = (w.title as string) || "Next Actions";

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-5 min-w-0">
      <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
        {title}
      </span>

      {items.length > 0 ? (
        <ol className="mt-3 space-y-2">
          {items.slice(0, 8).map((x, i) => (
            <li
              key={i}
              className="flex gap-3 rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm text-zinc-200"
            >
              <span className="flex-shrink-0 font-medium text-zinc-500">{i + 1}.</span>
              <span className="leading-relaxed">{x}</span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-3 text-sm text-zinc-500">No next actions yet. Say what you want to do next.</p>
      )}
    </div>
  );
}
