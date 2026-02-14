"use client";

export default function AssumptionsWidget({ w }: { w: any }) {
  const items: string[] = w.data?.items ?? [];
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
      <div className="text-sm text-zinc-300">Assumptions</div>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.length ? items.slice(0, 10).map((x, i) => (
          <span key={i} className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs text-zinc-200">
            {x}
          </span>
        )) : <div className="text-sm text-zinc-500">—</div>}
      </div>
    </div>
  );
}
