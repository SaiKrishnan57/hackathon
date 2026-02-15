"use client";

export default function Reflective({ payload }: { payload: any }) {
  const points: string[] = payload?.summary_points ?? [];
  const chips: string[] = payload?.prompt_chips ?? [];
  const goal = payload?.goal;

  return (
    <div className="space-y-5">
      <div className="text-xs font-medium uppercase tracking-wider text-zinc-500">
        Reflective workspace
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-5">
        <h3 className="text-lg font-semibold text-zinc-100">Slow down and clarify</h3>
        {goal && (
          <p className="mt-1 text-sm text-zinc-400">{goal}</p>
        )}
        <div className="mt-3 text-sm text-zinc-200">
          {points.length > 0 ? (
            <ul className="list-disc space-y-1.5 pl-5">
              {points.slice(0, 5).map((p, i) => (
                <li key={i} className="leading-relaxed">{p}</li>
              ))}
            </ul>
          ) : (
            <p className="text-zinc-400">
              Share what’s on your mind. I’ll structure it gently.
            </p>
          )}
        </div>
      </div>

      {chips.length > 0 && (
        <div>
          <div className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
            Things to explore
          </div>
          <div className="flex flex-wrap gap-2">
            {chips.slice(0, 8).map((c, i) => (
              <span
                key={i}
                className="rounded-full border border-zinc-700 bg-zinc-900/80 px-3 py-1.5 text-xs text-zinc-200"
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
