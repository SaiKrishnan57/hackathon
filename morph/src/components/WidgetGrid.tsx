"use client";

import { motion, AnimatePresence } from "framer-motion";
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

// Priority-based grid span
function getSpanClass(w: any) {
  const p = w.priority ?? 0;

  // brief always full width
  if (w.type === "brief") return "md:col-span-2 xl:col-span-3";

  // very important widgets expand more
  if (p >= 85) return "md:col-span-2 xl:col-span-2";

  // normal widgets
  return "md:col-span-1 xl:col-span-1";
}

export default function WidgetGrid({ widgets }: { widgets: any[] }) {
  return (
    <div className="grid gap-3 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
      <AnimatePresence mode="popLayout">
        {widgets.map((w) => {
          const child = renderWidget(w);
          if (!child) return null;

          return (
            <motion.div
              key={w.id}
              layout
              initial={{ opacity: 0, y: 12, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.22 }}
              className={getSpanClass(w)}
            >
              {/* Subtle "fresh" highlight if widget is marked updated */}
              <motion.div
                initial={false}
                animate={
                  w._flash
                    ? {
                        boxShadow:
                          "0 0 0 1px rgba(255,255,255,0.10), 0 0 24px rgba(255,255,255,0.08)",
                      }
                    : { boxShadow: "0 0 0 0 rgba(0,0,0,0)" }
                }
                transition={{ duration: 0.35 }}
                className="rounded-2xl"
              >
                {child}
              </motion.div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
