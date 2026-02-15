"use client";

type Step = { phase?: string; action?: string; duration?: string };

export default function Planning({ payload }: { payload: any }) {
  const goal = payload?.goal ?? "Your plan";
  const horizon = payload?.horizon;
  const steps: Step[] = payload?.steps ?? [];

  return (
    <div className="space-y-5">
      <div className="text-xs font-medium uppercase tracking-wider text-zinc-500">
        Planning workspace
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-semibold text-zinc-100">{goal}</h3>
          {horizon && (
            <span className="rounded-full border border-zinc-700 bg-zinc-900/80 px-2.5 py-0.5 text-xs text-zinc-300">
              {horizon}
            </span>
          )}
        </div>

        <div className="mt-4 space-y-3">
          {steps.length > 0 ? (
            steps.slice(0, 10).map((s, i) => (
              <div
                key={i}
                className="flex gap-3 rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-3"
              >
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-medium text-zinc-400">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium text-zinc-400">
                      {s.phase ?? `Step ${i + 1}`}
                    </span>
                    {s.duration && (
                      <span className="text-xs text-zinc-500">· {s.duration}</span>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-zinc-100">{s.action ?? "—"}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-zinc-400">
              Ask for a plan with a timeframe, e.g. “Give me a 4-week plan”.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
