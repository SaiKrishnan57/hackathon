"use client";

type Step = { phase?: string; action?: string; duration?: string };

export default function TimelineWidget({ w }: { w: any }) {
  const d = w.data ?? {};
  const goal = (d.goal as string) ?? "Plan";
  const horizon = typeof d.horizon === "string" ? d.horizon : null;
  const steps: Step[] = Array.isArray(d.steps) ? d.steps : [];

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          Timeline
        </span>
        {horizon && (
          <span className="rounded-full border border-zinc-700 bg-zinc-900/80 px-2.5 py-0.5 text-xs text-zinc-300">
            {horizon}
          </span>
        )}
      </div>
      <h3 className="mt-2 text-base font-semibold text-zinc-100">{goal}</h3>

      <div className="mt-4 space-y-3">
        {steps.length > 0 ? (
          steps.slice(0, 10).map((s, i) => (
            <div
              key={i}
              className="flex gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3"
            >
              <div className="flex flex-shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-medium text-zinc-400 w-7 h-7">
                {i + 1}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-zinc-400">{s.phase ?? `Step ${i + 1}`}</span>
                  {s.duration && (
                    <span className="text-xs text-zinc-500">· {s.duration}</span>
                  )}
                </div>
                <p className="mt-0.5 text-sm text-zinc-100">{s.action ?? "—"}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-zinc-500">Ask for a plan with a timeframe to see steps here.</p>
        )}
      </div>
    </div>
  );
}
