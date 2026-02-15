"use client";

const STATUS_LABELS: Record<string, string> = {
  exploring: "Exploring",
  deciding: "Deciding",
  planning: "Planning"
};

export default function BriefWidget({ w }: { w: any }) {
  const d = w.data ?? {};
  const conf = Math.round((Number(d.confidence) || 0.5) * 100);
  const status = (d.status as string) || "exploring";
  const goal = (d.goal as string) || "—";
  const summary = typeof d.summary === "string" ? d.summary : null;
  const constraints: string[] = Array.isArray(d.constraints) ? d.constraints : [];
  const missing: string[] = Array.isArray(d.missing_inputs) ? d.missing_inputs : [];

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-5 md:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          Live Brief
        </span>
        <div className="flex items-center gap-2">
          <span
            className="rounded-full border border-zinc-700 bg-zinc-900/80 px-2.5 py-0.5 text-xs font-medium text-zinc-300"
            title="Current phase"
          >
            {STATUS_LABELS[status] ?? status}
          </span>
          <span className="text-xs text-zinc-500" title="Confidence in current understanding">
            {conf}%
          </span>
        </div>
      </div>

      <h3 className="mt-3 text-lg font-semibold leading-snug text-zinc-100">{goal}</h3>

      {summary && (
        <p className="mt-2 text-sm leading-relaxed text-zinc-300">{summary}</p>
      )}

      <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Constraints
          </div>
          {constraints.length > 0 ? (
            <ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-sm text-zinc-200">
              {constraints.slice(0, 5).map((c: string, i: number) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-1.5 text-sm text-zinc-500">None specified</p>
          )}
        </div>
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Missing inputs
          </div>
          {missing.length > 0 ? (
            <ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-sm text-zinc-200">
              {missing.slice(0, 4).map((m: string, i: number) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-1.5 text-sm text-zinc-500">—</p>
          )}
        </div>
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Confidence
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-zinc-200 transition-[width] duration-300"
                style={{ width: `${conf}%` }}
              />
            </div>
            <span className="text-xs text-zinc-400">{conf}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
