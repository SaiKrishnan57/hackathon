export default function Planning({ payload }: { payload: any }) {
  const goal = payload?.goal ?? "Your plan";
  const steps = payload?.steps ?? [];

  return (
    <div className="space-y-4">
      <div className="text-sm text-zinc-300">Planning workspace</div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
        <div className="text-lg font-medium">{goal}</div>

        <div className="mt-3 space-y-3">
          {(steps as any[]).slice(0, 8).map((s, i) => (
            <div key={i} className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2">
              <div className="text-xs text-zinc-400">{s.phase}</div>
              <div className="text-sm text-zinc-100">{s.action}</div>
            </div>
          ))}

          {steps.length === 0 && (
            <div className="text-sm text-zinc-400">
              Ask for a plan with a timeframe, like “Give me a 4-week plan”.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
