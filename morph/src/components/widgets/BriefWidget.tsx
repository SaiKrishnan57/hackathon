"use client";

export default function BriefWidget({ w }: { w: any }) {
  const d = w.data ?? {};
  const conf = Math.round((d.confidence ?? 0.5) * 100);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4 md:col-span-2">
      <div className="flex items-center justify-between">
        <div className="text-sm text-zinc-400">Live Brief</div>
        <div className="text-xs text-zinc-400">{d.status ?? "exploring"} · {conf}%</div>
      </div>

      <div className="mt-2 text-lg font-semibold text-zinc-100">{d.goal ?? "—"}</div>

      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <div>
          <div className="text-xs text-zinc-500">Constraints</div>
          <div className="mt-1 text-sm text-zinc-200">
            {(d.constraints ?? []).slice(0, 5).join(", ") || "—"}
          </div>
        </div>
        <div>
          <div className="text-xs text-zinc-500">Missing Inputs</div>
          <div className="mt-1 text-sm text-zinc-200">
            {(d.missing_inputs ?? []).slice(0, 4).join(", ") || "—"}
          </div>
        </div>
        <div>
          <div className="text-xs text-zinc-500">Confidence</div>
          <div className="mt-2 h-2 w-full rounded-full bg-zinc-800">
            <div className="h-2 rounded-full bg-zinc-200" style={{ width: `${conf}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
