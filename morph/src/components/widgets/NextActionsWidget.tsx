"use client";

export default function NextActionsWidget({ w }: { w: any }) {
  const items: string[] = w.data?.items ?? [];
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
      <div className="text-sm text-zinc-300">Next Actions</div>
      <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-zinc-200">
        {items.length ? items.slice(0, 6).map((x, i) => <li key={i}>{x}</li>) : <li className="text-zinc-500">—</li>}
      </ol>
    </div>
  );
}
