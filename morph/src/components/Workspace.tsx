"use client";

import WidgetGrid from "./WidgetGrid";

export default function Workspace({
  mode,
  dashboard
}: {
  mode: "reflective" | "analytical" | "planning";
  dashboard: any;
}) {
  return (
    <div className="space-y-3">
      <div className="text-xs text-zinc-500">Mode: {mode}</div>
      <WidgetGrid widgets={dashboard?.widgets ?? []} />
    </div>
  );
}
