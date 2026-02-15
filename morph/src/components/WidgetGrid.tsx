"use client";

import { AnimatePresence, motion } from "framer-motion";
import BriefWidget from "./widgets/BriefWidget";
import AssumptionsWidget from "./widgets/AssumptionsWidget";
import ComparisonWidget from "./widgets/ComparisonWidget";
import TimelineWidget from "./widgets/TimelineWidget";
import NextActionsWidget from "./widgets/NextActionsWidget";

function renderWidget(w: any) {
  switch (w.type) {
    case "brief":
      return <BriefWidget w={w} />;
    case "assumptions":
      return <AssumptionsWidget w={w} />;
    case "comparison_table":
      return <ComparisonWidget w={w} />;
    case "timeline":
      return <TimelineWidget w={w} />;
    case "next_actions":
      return <NextActionsWidget w={w} />;
    default:
      return null;
  }
}

// Fixed spans for a stable dashboard:
// - Big widgets span both columns
// - Small widgets span one column
function spanClass(w: any) {
  if (w.type === "brief") return "col-span-2";
  if (w.type === "comparison_table") return "col-span-2";
  return "col-span-1";
}

export default function WidgetGrid({ widgets }: { widgets: any[] }) {
  // Stable ordering:
  // brief first, then comparison, then others by priority
  const ordered = [...(widgets ?? [])].sort((a, b) => {
    const rank = (x: any) => {
      if (x.type === "brief") return 0;
      if (x.type === "comparison_table") return 1;
      return 2;
    };
    const r = rank(a) - rank(b);
    if (r !== 0) return r;

    const pr = (b.priority ?? 0) - (a.priority ?? 0);
    if (pr !== 0) return pr;

    return String(a.id).localeCompare(String(b.id));
  });

  return (
    <div className="grid grid-cols-2 gap-3 grid-flow-row-dense">
      <AnimatePresence mode="popLayout">
        {ordered.map((w) => {
          const child = renderWidget(w);
          if (!child) return null;

          return (
            <motion.div
              key={w.id}
              layout
              initial={{ opacity: 0, y: 10, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.99 }}
              transition={{ duration: 0.2 }}
              className={`${spanClass(w)} min-w-0`}
            >
              {child}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
