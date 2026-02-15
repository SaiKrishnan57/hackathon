"use client";

export default function ComparisonWidget({ w }: { w: any }) {
  const d = w.data ?? {};
  const a = (d.options?.a_label as string) ?? "Option A";
  const b = (d.options?.b_label as string) ?? "Option B";
  const rows = Array.isArray(d.rows) ? d.rows : [];
  const summary = typeof d.summary === "string" ? d.summary : null;
  const title = (w.title as string) || "Comparison";

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-5 min-w-0">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          {title}
        </span>
      </div>

      <div className="mt-3 overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/60 text-xs text-zinc-400">
              <th className="w-[26%] px-4 py-3 text-left font-medium">Factor</th>
              <th className="w-[37%] px-4 py-3 text-left font-medium">{a}</th>
              <th className="w-[37%] px-4 py-3 text-left font-medium">{b}</th>
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.slice(0, 12).map((r: { factor?: string; a?: string; b?: string }, i: number) => (
                <tr
                  key={i}
                  className="border-b border-zinc-800/80 transition-colors hover:bg-zinc-900/30"
                >
                  <td className="px-4 py-3 text-zinc-200 align-top">{r.factor ?? "—"}</td>
                  <td className="px-4 py-3 text-zinc-100 align-top">{r.a ?? "—"}</td>
                  <td className="px-4 py-3 text-zinc-100 align-top">{r.b ?? "—"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-6 text-center text-sm text-zinc-500"
                >
                  Ask to compare two options and the factors will appear here.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {summary && (
        <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-3">
          <div className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Takeaway
          </div>
          <p className="mt-1 text-sm leading-relaxed text-zinc-200">{summary}</p>
        </div>
      )}
    </div>
  );
}
