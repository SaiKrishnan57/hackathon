"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Workspace from "./Workspace";
import type { ChatMessage, MorphResponse } from "@/lib/schema";

type Mode = "reflective" | "analytical" | "planning";

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Mode>("reflective");
  const [workspace, setWorkspace] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(false);

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
        body: JSON.stringify({ messages: nextMsgs })
      });

      const data = await res.json();

      if (!res.ok) {
        setMessages((m) => [...m, { role: "assistant", content: "Something went wrong. Try again." }]);
        return;
      }

      const parsed = data as MorphResponse;

      setMode(parsed.mode);
      setWorkspace(parsed.workspace_payload ?? null);
      setMessages((m) => [...m, { role: "assistant", content: parsed.assistant_response }]);
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) send();
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <header className="mb-6">
          <div className="text-2xl font-semibold">Morph</div>
          <div className="text-zinc-400">The interface changes as the conversation changes.</div>
        </header>

        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4">
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
                className="flex-1 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-600"
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

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.22 }}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4"
            >
              <Workspace mode={mode} payload={workspace} />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-4 text-xs text-zinc-500">
          Mode: <span className="text-zinc-300">{mode}</span>
        </div>
      </div>
    </div>
  );
}
