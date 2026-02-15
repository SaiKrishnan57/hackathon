"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Workspace from "./Workspace";
import type { ChatMessage, MorphResponse } from "@/lib/schema";

type Mode = "reflective" | "analytical" | "planning";

function modeLabel(mode: Mode) {
  if (mode === "reflective") return "Reflective";
  if (mode === "analytical") return "Analytical";
  return "Planning";
}

function modeRGBA(mode: Mode) {
  // R,G,B for each mode
  if (mode === "reflective") return "168,85,247"; // violet
  if (mode === "analytical") return "34,211,238"; // cyan
  return "16,185,129"; // emerald
}

function modeAccentClass(mode: Mode) {
  if (mode === "reflective")
    return "text-violet-200 border-violet-500/30 bg-violet-500/10";
  if (mode === "analytical")
    return "text-cyan-200 border-cyan-500/30 bg-cyan-500/10";
  return "text-emerald-200 border-emerald-500/30 bg-emerald-500/10";
}

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Mode>("reflective");
  const [prevMode, setPrevMode] = useState<Mode>("reflective");
  const [dashboardState, setDashboardState] = useState<any>({ widgets: [] });
  const [loading, setLoading] = useState(false);

  // Optional: subtle toast when mode changes
  const [modeToast, setModeToast] = useState<string | null>(null);
  useEffect(() => {
    if (!mode) return;
    setModeToast(`Switched to ${modeLabel(mode)}`);
    const t = setTimeout(() => setModeToast(null), 1200);
    return () => clearTimeout(t);
  }, [mode]);

  function mergeDashboard(prev: any, incoming: any) {
    if (!incoming) return prev;

    if (incoming.action === "set") {
      return { widgets: incoming.widgets ?? [] };
    }

    const prevMap = new Map((prev.widgets ?? []).map((w: any) => [w.id, w]));
    for (const w of incoming.widgets ?? []) {
      prevMap.set(w.id, { ...(prevMap.get(w.id) ?? {}), ...w });
    }

    const merged = Array.from(prevMap.values());
    merged.sort(
      (a: any, b: any) =>
        (b.priority ?? 0) - (a.priority ?? 0) ||
        String(a.id).localeCompare(String(b.id))
    );

    return { widgets: merged };
  }

  const canSend = input.trim().length > 0 && !loading;

  async function send() {
    if (!canSend) return;

    const userMsg: ChatMessage = { role: "user", content: input.trim() };
    const nextMsgs = [...messages, userMsg];

    setMessages(nextMsgs);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/morph", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMsgs, dashboardState }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessages((m) => [
          ...m,
          { role: "assistant", content: "Something went wrong. Try again." },
        ]);
        return;
      }

      const parsed = data as MorphResponse;

      // Track previous mode for sweep animation
      setPrevMode(mode);
      setMode(parsed.mode);

      setDashboardState((prev: any) => mergeDashboard(prev, parsed.dashboard));
      setMessages((m) => [
        ...m,
        { role: "assistant", content: parsed.assistant_response },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) send();
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 relative overflow-hidden">
      {/* Mode glow sweep (slides left → right on mode change) */}
      <motion.div
        key={mode}
        className="pointer-events-none absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
      >
        <motion.div
          className="absolute inset-0"
          initial={{
            background: `radial-gradient(circle at 18% 18%, rgba(${modeRGBA(
              prevMode
            )},0.22) 0%, rgba(0,0,0,0) 55%)`,
          }}
          animate={{
            background: `radial-gradient(circle at 82% 18%, rgba(${modeRGBA(
              mode
            )},0.22) 0%, rgba(0,0,0,0) 55%)`,
          }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
        />
      </motion.div>

      {/* Soft vignette for readability */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.40)_70%,rgba(0,0,0,0.75)_100%)]" />

      {/* Content */}
      <div className="relative">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <header className="mb-3 flex items-start justify-between gap-4">
            <div>
              <div className="text-2xl font-semibold">Morph</div>
              <div className="text-zinc-400">
                AI Dashboard Engine — conversation composes your interface.
              </div>
            </div>

            {/* Mode Indicator */}
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, x: 14 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -14 }}
                transition={{ duration: 0.22 }}
                className={`rounded-full border px-3 py-1 text-xs font-medium backdrop-blur ${modeAccentClass(
                  mode
                )}`}
              >
                Mode: {modeLabel(mode)}
              </motion.div>
            </AnimatePresence>
          </header>

          {/* Optional toast */}
          <AnimatePresence>
            {modeToast && (
              <motion.div
                key={modeToast}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="mb-4 text-xs text-zinc-300"
              >
                {modeToast}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            {/* Chat Panel */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4 backdrop-blur">
              <div className="h-[56vh] overflow-y-auto pr-2">
                <div className="space-y-3">
                  {messages.map((m, idx) => (
                    <div
                      key={idx}
                      className={`rounded-xl px-3 py-2 text-sm leading-relaxed ${
                        m.role === "user"
                          ? "ml-auto max-w-[85%] bg-zinc-200 text-zinc-900"
                          : "mr-auto max-w-[85%] bg-zinc-800 text-zinc-100"
                      }`}
                    >
                      {m.content}
                    </div>
                  ))}

                  {loading && (
                    <div className="mr-auto max-w-[85%] rounded-xl bg-zinc-800 px-3 py-2 text-sm text-zinc-200">
                      Thinking…
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Type here… (Ctrl+Enter to send)"
                  className="flex-1 rounded-xl border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm outline-none focus:border-zinc-600"
                />
                <button
                  onClick={send}
                  disabled={!canSend}
                  className="rounded-xl bg-zinc-200 px-4 py-2 text-sm font-medium text-zinc-900 disabled:opacity-40"
                >
                  Send
                </button>
              </div>
            </div>

            {/* Dashboard Panel */}
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.22 }}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4 h-[56vh] overflow-y-auto backdrop-blur"
              >
                <Workspace mode={mode} dashboard={dashboardState} />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-4 text-xs text-zinc-500">
            Mode: <span className="text-zinc-300">{mode}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
