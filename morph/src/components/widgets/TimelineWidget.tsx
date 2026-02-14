"use client";

export default function TimelineWidget({ w }: { w: any }) {
  const d = w.data ?? {};
  const goal = d.goal ?? "Plan";
  const steps = d.steps ?? [];

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
      <div className="text-sm text-zinc-300">Timeline</div>
      <div className="mt-1 text-base font-semibold text-zinc-100">{goal}</div>
      <div className="mt-3 space-y-2">
        {steps.length ? steps.slice(0, 8).map((s: any, i: number) => (
          <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2">
            <div className="text-xs text-zinc-500">{s.phase}</div>
            <div className="text-sm text-zinc-100">{s.action}</div>
          </div>
        )) : <div className="text-sm text-zinc-500">—</div>}
      </div>
    </div>
  );
}
