"use client";

export default function Analytical({ payload }: { payload: any }) {
  const title = payload?.title ?? "Compare Options";
  const aLabel = payload?.options?.a_label ?? "Option A";
  const bLabel = payload?.options?.b_label ?? "Option B";
  const factors = payload?.factors ?? [];

  const assumptions: string[] = payload?.assumptions ?? [];
  const missing: string[] = payload?.missing_inputs ?? [];
  const nextActions: string[] = payload?.next_actions ?? [];

  return (
    <div className="space-y-6">

      {/* Workspace Label */}
      <div className="text-sm text-zinc-400 uppercase tracking-wide">
        Analytical Workspace
      </div>

      {/* Title */}
      <div className="text-2xl font-semibold">
        {title}
      </div>

      {/* Assumptions */}
      {assumptions.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm text-zinc-400">Assumptions</div>
          <div className="flex flex-wrap gap-2">
            {assumptions.map((a, i) => (
              <span
                key={i}
                className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs text-zinc-200"
              >
                {a}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Comparison Table */}
      <div className="overflow-hidden rounded-xl border border-zinc-800">
        <div className="grid grid-cols-3 bg-zinc-950/40 text-xs text-zinc-400">
          <div className="px-4 py-3">Factor</div>
          <div className="px-4 py-3">{aLabel}</div>
          <div className="px-4 py-3">{bLabel}</div>
        </div>

        <div className="divide-y divide-zinc-800">
          {factors.length > 0 ? (
            factors.slice(0, 8).map((row: any, i: number) => (
              <div key={i} className="grid grid-cols-3 text-sm">
                <div className="px-4 py-3 text-zinc-200">
                  {row.factor}
                </div>
                <div className="px-4 py-3 text-zinc-100">
                  {row.a}
                </div>
                <div className="px-4 py-3 text-zinc-100">
                  {row.b}
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-4 text-sm text-zinc-500">
              Ask to compare two options and I’ll structure it here.
            </div>
          )}
        </div>
      </div>

      {/* Missing Inputs */}
      {missing.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm text-zinc-400">Missing Inputs</div>
          <ul className="list-disc pl-6 text-sm text-zinc-200 space-y-1">
            {missing.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Next Actions */}
      {nextActions.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm text-zinc-400">Next Actions</div>
          <ol className="list-decimal pl-6 text-sm text-zinc-200 space-y-1">
            {nextActions.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
