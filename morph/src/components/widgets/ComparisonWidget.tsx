"use client";

export default function ComparisonWidget({ w }: { w: any }) {
  const d = w.data ?? {};
  const a = d.options?.a_label ?? "Option A";
  const b = d.options?.b_label ?? "Option B";
  const rows = d.rows ?? [];

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4 min-w-0">
      <div className="text-sm text-zinc-300">{w.title ?? "Comparison"}</div>

      <div className="mt-3 overflow-x-auto">
        <table className="min-w-[720px] w-full border-collapse">
          <thead>
            <tr className="text-xs text-zinc-400 bg-zinc-950/60">
              <th className="text-left px-3 py-2 border border-zinc-800 w-[28%]">Factor</th>
              <th className="text-left px-3 py-2 border border-zinc-800 w-[36%]">{a}</th>
              <th className="text-left px-3 py-2 border border-zinc-800 w-[36%]">{b}</th>
            </tr>
          </thead>

          <tbody>
            {rows.length ? (
              rows.slice(0, 10).map((r: any, i: number) => (
                <tr key={i} className="text-sm">
                  <td className="px-3 py-2 border border-zinc-800 text-zinc-200 align-top break-words">
                    {r.factor}
                  </td>
                  <td className="px-3 py-2 border border-zinc-800 text-zinc-100 align-top break-words">
                    {r.a}
                  </td>
                  <td className="px-3 py-2 border border-zinc-800 text-zinc-100 align-top break-words">
                    {r.b}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={3}
                  className="px-3 py-3 text-sm text-zinc-500 border border-zinc-800"
                >
                  —
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-2 text-xs text-zinc-500">
        Scroll horizontally to view full table if needed.
      </div>
    </div>
  );
}
