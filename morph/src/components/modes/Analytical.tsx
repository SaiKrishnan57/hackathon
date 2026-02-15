"use client";

export default function Analytical({ payload }: { payload: any }) {
  const title = payload?.title ?? "Compare Options";
  const aLabel = payload?.options?.a_label ?? "Option A";
  const bLabel = payload?.options?.b_label ?? "Option B";
  const factors = payload?.factors ?? [];
  const summary = payload?.summary;
  const assumptions: string[] = payload?.assumptions ?? [];
  const missing: string[] = payload?.missing_inputs ?? [];
  const nextActions: string[] = payload?.next_actions ?? [];

  return (
    <div className="space-y-6">
      <div className="text-xs font-medium uppercase tracking-wider text-zinc-500">
        Analytical workspace
      </div>

      <h2 className="text-xl font-semibold text-zinc-100">{title}</h2>

      {assumptions.length > 0 && (
        <div>
          <div className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
            Assumptions
          </div>
          <div className="flex flex-wrap gap-2">
            {assumptions.map((a, i) => (
              <span
                key={i}
                className="rounded-full border border-zinc-700 bg-zinc-900/80 px-3 py-1 text-xs text-zinc-200"
              >
                {a}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-zinc-800">
        <div className="grid grid-cols-3 border-b border-zinc-800 bg-zinc-950/60 text-xs font-medium text-zinc-400">
          <div className="px-4 py-3">Factor</div>
          <div className="px-4 py-3">{aLabel}</div>
          <div className="px-4 py-3">{bLabel}</div>
        </div>
        <div className="divide-y divide-zinc-800">
          {factors.length > 0 ? (
            factors.slice(0, 10).map((row: { factor?: string; a?: string; b?: string }, i: number) => (
              <div key={i} className="grid grid-cols-3 text-sm">
                <div className="px-4 py-3 text-zinc-200">{row.factor ?? "—"}</div>
                <div className="px-4 py-3 text-zinc-100">{row.a ?? "—"}</div>
                <div className="px-4 py-3 text-zinc-100">{row.b ?? "—"}</div>
              </div>
            ))
          ) : (
            <div className="px-4 py-6 text-center text-sm text-zinc-500">
              Ask to compare two options and I’ll structure it here.
            </div>
          )}
        </div>
      </div>

      {summary && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-3">
          <div className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Takeaway
          </div>
          <p className="mt-1 text-sm leading-relaxed text-zinc-200">{summary}</p>
        </div>
      )}

      {missing.length > 0 && (
        <div>
          <div className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
            Missing inputs
          </div>
          <ul className="list-disc space-y-0.5 pl-5 text-sm text-zinc-200">
            {missing.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </div>
      )}

      {nextActions.length > 0 && (
        <div>
          <div className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
            Next actions
          </div>
          <ol className="list-decimal space-y-1 pl-5 text-sm text-zinc-200">
            {nextActions.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
