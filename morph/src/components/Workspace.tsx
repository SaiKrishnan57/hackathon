"use client";

import Reflective from "./modes/Reflective";
import Analytical from "./modes/Analytical";
import Planning from "./modes/Planning";

export default function Workspace({
  mode,
  payload
}: {
  mode: "reflective" | "analytical" | "planning";
  payload: Record<string, any> | null;
}) {
  if (mode === "analytical") return <Analytical payload={payload} />;
  if (mode === "planning") return <Planning payload={payload} />;
  return <Reflective payload={payload} />;
}
