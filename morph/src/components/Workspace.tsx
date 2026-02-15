"use client";

import { useMemo } from "react";
import Reflective from "./modes/Reflective";
import Analytical from "./modes/Analytical";
import Planning from "./modes/Planning";

type Mode = "reflective" | "analytical" | "planning";
type Widget = { id: string; type: string; title?: string; data?: Record<string, unknown> };

function buildReflectivePayload(widgets: Widget[]) {
  const brief = widgets.find((w) => w.type === "brief");
  const assumptionsWidget = widgets.find((w) => w.type === "assumptions");
  const nextActionsWidget = widgets.find((w) => w.type === "next_actions");

  const data = (brief?.data ?? {}) as Record<string, unknown>;
  const goal = typeof data.goal === "string" ? data.goal : null;
  const summary = typeof data.summary === "string" ? data.summary : null;
  const constraints = Array.isArray(data.constraints) ? (data.constraints as string[]) : [];
  const missing = Array.isArray(data.missing_inputs) ? (data.missing_inputs as string[]) : [];
  const status = typeof data.status === "string" ? data.status : null;
  const confidence = typeof data.confidence === "number" ? data.confidence : null;

  const assumptions = (assumptionsWidget?.data as Record<string, unknown>)?.items;
  const assumptionsList = Array.isArray(assumptions) ? (assumptions as string[]) : [];
  const nextData = (nextActionsWidget?.data ?? {}) as Record<string, unknown>;
  const next_actions = Array.isArray(nextData.items) ? (nextData.items as string[]) : [];

  const summary_points: string[] = [];
  if (summary) summary_points.push(summary);
  else if (goal) summary_points.push(goal);
  constraints.forEach((c) => summary_points.push(c));
  if (status) summary_points.push(`Status: ${status}`);

  const prompt_chips = missing.length > 0 ? missing : constraints;

  return {
    goal: goal ?? undefined,
    summary: summary ?? undefined,
    summary_points,
    prompt_chips,
    constraints,
    missing_inputs: missing,
    status: status ?? undefined,
    confidence: confidence ?? undefined,
    assumptions: assumptionsList,
    next_actions,
  };
}

function buildAnalyticalPayload(widgets: Widget[]) {
  const comparison = widgets.find((w) => w.type === "comparison_table");
  const assumptionsWidget = widgets.find((w) => w.type === "assumptions");
  const brief = widgets.find((w) => w.type === "brief");
  const nextActions = widgets.find((w) => w.type === "next_actions");

  const compData = (comparison?.data ?? {}) as Record<string, unknown>;
  const options = (compData.options ?? {}) as Record<string, string>;
  const rows = (Array.isArray(compData.rows) ? compData.rows : []) as Array<{
    factor?: string;
    a?: string;
    b?: string;
  }>;
  const factors = rows.map((r) => ({
    factor: r.factor ?? "",
    a: r.a ?? "",
    b: r.b ?? ""
  }));

  const assumptions = (assumptionsWidget?.data as Record<string, unknown>)?.items;
  const assumptionsList = Array.isArray(assumptions) ? (assumptions as string[]) : [];

  const briefData = (brief?.data ?? {}) as Record<string, unknown>;
  const missing_inputs = Array.isArray(briefData.missing_inputs)
    ? (briefData.missing_inputs as string[])
    : [];

  const nextData = (nextActions?.data ?? {}) as Record<string, unknown>;
  const next_actions = Array.isArray(nextData.items) ? (nextData.items as string[]) : [];

  const comparisonSummary = typeof compData.summary === "string" ? compData.summary : null;

  return {
    title: (comparison?.title as string) ?? "Compare Options",
    options: { a_label: options.a_label ?? "Option A", b_label: options.b_label ?? "Option B" },
    factors,
    summary: comparisonSummary,
    assumptions: assumptionsList,
    missing_inputs,
    next_actions
  };
}

function buildPlanningPayload(widgets: Widget[]) {
  const timeline = widgets.find((w) => w.type === "timeline");
  const brief = widgets.find((w) => w.type === "brief");

  const timelineData = (timeline?.data ?? {}) as Record<string, unknown>;
  const briefData = (brief?.data ?? {}) as Record<string, unknown>;

  const goal =
    (typeof timelineData.goal === "string" ? timelineData.goal : null) ??
    (typeof briefData.goal === "string" ? briefData.goal : null) ??
    "Your plan";

  const steps = Array.isArray(timelineData.steps)
    ? (timelineData.steps as Array<{ phase?: string; action?: string; duration?: string }>)
    : [];
  const horizon = typeof timelineData.horizon === "string" ? timelineData.horizon : null;

  return { goal, horizon, steps };
}

type WorkspaceProps = Readonly<{
  mode: Mode;
  dashboard: { widgets?: Widget[] };
}>;

export default function Workspace({ mode, dashboard }: WorkspaceProps) {
  const widgets = dashboard?.widgets ?? [];

  const reflectivePayload = useMemo(() => buildReflectivePayload(widgets), [widgets]);
  const analyticalPayload = useMemo(() => buildAnalyticalPayload(widgets), [widgets]);
  const planningPayload = useMemo(() => buildPlanningPayload(widgets), [widgets]);

  if (mode === "reflective") {
    return <Reflective payload={reflectivePayload} />;
  }
  if (mode === "analytical") {
    return <Analytical payload={analyticalPayload} />;
  }
  return <Planning payload={planningPayload} />;
}
