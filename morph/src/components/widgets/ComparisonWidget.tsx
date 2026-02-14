"use client";

export default function ComparisonWidget({ w }: { w: any }) {
  const d = w.data ?? {};
  const a = d.options?.a_label ?? "Option A";
  const b = d.options?.b_label ?? "Option B";
  const rows = d.rows ?? [];

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4 md:col-span-2">
      <div className="text-sm text-zinc-300">{w.title ?? "Comparison"}</div>
      <div className="mt-3 overflow-hidden rounded-xl border border-zinc-800">
        <div className="grid grid-cols-3 bg-zinc-950/60 text-xs text-zinc-400">
          <div className="px-3 py-2">Factor</div>
          <div className="px-3 py-2">{a}</div>
          <div className="px-3 py-2">{b}</div>
        </div>
        <div className="divide-y divide-zinc-800">
          {rows.length ? rows.slice(0, 8).map((r: any, i: number) => (
            <div key={i} className="grid grid-cols-3 text-sm">
              <div className="px-3 py-2 text-zinc-200">{r.factor}</div>
              <div className="px-3 py-2 text-zinc-100">{r.a}</div>
              <div className="px-3 py-2 text-zinc-100">{r.b}</div>
            </div>
          )) : (
            <div className="px-3 py-3 text-sm text-zinc-500">—</div>
          )}
        </div>
      </div>
    </div>
  );
}
