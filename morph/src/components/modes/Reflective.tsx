export default function Reflective({ payload }: { payload: any }) {
  const points: string[] = payload?.summary_points ?? [];
  const chips: string[] = payload?.prompt_chips ?? [];

  return (
    <div className="space-y-4">
      <div className="text-sm text-zinc-300">Reflective workspace</div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
        <div className="text-lg font-medium">Slow down and clarify</div>
        <div className="mt-2 text-sm text-zinc-200">
          {points.length ? (
            <ul className="list-disc space-y-1 pl-5">
              {points.slice(0, 4).map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          ) : (
            <div className="text-zinc-400">Share what’s on your mind. I’ll structure it gently.</div>
          )}
        </div>
      </div>

      {chips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {chips.slice(0, 6).map((c, i) => (
            <span
              key={i}
              className="rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1 text-xs text-zinc-200"
            >
              {c}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
