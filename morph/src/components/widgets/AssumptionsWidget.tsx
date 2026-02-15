"use client";

export default function AssumptionsWidget({ w }: { w: any }) {
  const items: string[] = w.data?.items ?? [];

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4 min-w-0">
      <div className="flex items-center justify-between">
        <div className="text-sm text-zinc-300">Assumptions</div>
        <div className="text-xs text-zinc-500">{items.length || 0}</div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {items.length ? (
          items.slice(0, 12).map((x, i) => (
            <span
              key={i}
              className="max-w-full rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs text-zinc-200 leading-snug break-words"
              title={x}
            >
              {x}
            </span>
          ))
        ) : (
          <div className="text-sm text-zinc-500">—</div>
        )}
      </div>
    </div>
  );
}
