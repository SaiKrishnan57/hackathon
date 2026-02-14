export default function Analytical({ payload }: { payload: any }) {
  const title = payload?.title ?? "Compare";
  const aLabel = payload?.options?.a_label ?? "Option A";
  const bLabel = payload?.options?.b_label ?? "Option B";
  const factors = payload?.factors ?? [];

  return (
    <div className="space-y-4">
      <div className="text-sm text-zinc-300">Analytical workspace</div>
      <div className="text-lg font-medium">{title}</div>

      <div className="overflow-hidden rounded-xl border border-zinc-800">
        <div className="grid grid-cols-3 bg-zinc-950/40 text-xs text-zinc-300">
          <div className="px-3 py-2">Factor</div>
          <div className="px-3 py-2">{aLabel}</div>
          <div className="px-3 py-2">{bLabel}</div>
        </div>

        <div className="divide-y divide-zinc-800">
          {(factors as any[]).slice(0, 6).map((row, i) => (
            <div key={i} className="grid grid-cols-3 text-sm">
              <div className="px-3 py-2 text-zinc-200">{row.factor}</div>
              <div className="px-3 py-2 text-zinc-100">{row.a}</div>
              <div className="px-3 py-2 text-zinc-100">{row.b}</div>
            </div>
          ))}

          {factors.length === 0 && (
            <div className="px-3 py-3 text-sm text-zinc-400">
              Ask to compare two options. I’ll generate a structured table.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
