"use client";

const STATUS_LABELS: Record<string, string> = {
  exploring: "Exploring",
  deciding: "Deciding",
  planning: "Planning",
};

export default function Reflective({ payload }: { payload: any }) {
  const goal = payload?.goal;
  const summary = payload?.summary;
  const points: string[] = payload?.summary_points ?? [];
  const chips: string[] = payload?.prompt_chips ?? [];
  const constraints: string[] = payload?.constraints ?? [];
  const missing: string[] = payload?.missing_inputs ?? [];
  const status = payload?.status;
  const confidence = typeof payload?.confidence === "number" ? Math.round(payload.confidence * 100) : null;
  const assumptions: string[] = payload?.assumptions ?? [];
  const nextActions: string[] = payload?.next_actions ?? [];

  const hasContent =
    goal ||
    summary ||
    points.length > 0 ||
    constraints.length > 0 ||
    missing.length > 0 ||
    assumptions.length > 0 ||
    nextActions.length > 0 ||
    chips.length > 0;

  return (
    <div className="space-y-5">
      <div className="text-xs font-medium uppercase tracking-wider text-zinc-500">
        Reflective workspace
      </div>

      {/* Current focus */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-5">
        <h3 className="text-lg font-semibold text-zinc-100">Slow down and clarify</h3>
        {goal && (
          <p className="mt-2 text-sm font-medium text-zinc-200">{goal}</p>
        )}
        {summary && (
          <p className="mt-1.5 text-sm leading-relaxed text-zinc-300">{summary}</p>
        )}
        {(status || confidence != null) && (
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {status && (
              <span className="rounded-full border border-violet-500/40 bg-violet-500/10 px-2.5 py-0.5 text-xs font-medium text-violet-200">
                {STATUS_LABELS[status] ?? status}
              </span>
            )}
            {confidence != null && (
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-16 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-violet-400/80"
                    style={{ width: `${confidence}%` }}
                  />
                </div>
                <span className="text-xs text-zinc-400">{confidence}% clarity</span>
              </div>
            )}
          </div>
        )}
        {points.length > 0 && (
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-zinc-300">
            {points.slice(0, 5).map((p, i) => (
              <li key={i} className="leading-relaxed">{p}</li>
            ))}
          </ul>
        )}
        {!hasContent && (
          <p className="mt-3 text-sm text-zinc-400">
            Share what’s on your mind. I’ll structure it gently.
          </p>
        )}
      </div>

      {/* Constraints */}
      {constraints.length > 0 && (
        <div>
          <div className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
            Constraints
          </div>
          <ul className="space-y-1.5 rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-3">
            {constraints.slice(0, 6).map((c, i) => (
              <li key={i} className="text-sm text-zinc-200">• {c}</li>
            ))}
          </ul>
        </div>
      )}

      {/* What's unclear */}
      {missing.length > 0 && (
        <div>
          <div className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
            What’s unclear or missing
          </div>
          <ul className="space-y-1 rounded-lg border border-amber-500/20 bg-amber-950/20 px-4 py-3">
            {missing.slice(0, 5).map((m, i) => (
              <li key={i} className="text-sm text-amber-100/90">• {m}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Assumptions */}
      {assumptions.length > 0 && (
        <div>
          <div className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
            Assumptions we’re working with
          </div>
          <div className="flex flex-wrap gap-2">
            {assumptions.slice(0, 8).map((a, i) => (
              <span
                key={i}
                className="rounded-lg border border-zinc-700 bg-zinc-900/60 px-3 py-1.5 text-xs text-zinc-200"
              >
                {a}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Next steps to try */}
      {nextActions.length > 0 && (
        <div>
          <div className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
            Next steps to try
          </div>
          <ol className="list-decimal space-y-1.5 pl-5 text-sm text-zinc-200">
            {nextActions.slice(0, 5).map((n, i) => (
              <li key={i} className="leading-relaxed">{n}</li>
            ))}
          </ol>
        </div>
      )}

      {/* Things to explore (chips) */}
      {chips.length > 0 && (
        <div>
          <div className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
            Things to explore
          </div>
          <div className="flex flex-wrap gap-2">
            {chips.slice(0, 8).map((c, i) => (
              <span
                key={i}
                className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-xs text-violet-200"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
