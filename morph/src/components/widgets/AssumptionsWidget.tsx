"use client";

export default function AssumptionsWidget({ w }: { w: any }) {
  const items: string[] = Array.isArray(w.data?.items) ? w.data.items : [];
  const title = (w.title as string) || "Assumptions";

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-5 min-w-0">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          {title}
        </span>
        {items.length > 0 && (
          <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
            {items.length}
          </span>
        )}
      </div>

      {items.length > 0 ? (
        <ul className="mt-3 space-y-2 pl-0 list-none">
          {items.slice(0, 12).map((x, i) => (
            <li key={i} className="flex gap-2 text-sm text-zinc-200">
              <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-zinc-500" />
              <span className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 leading-relaxed flex-1">
                {x}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-zinc-500">No assumptions recorded yet.</p>
      )}
    </div>
  );
}
