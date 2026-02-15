"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Workspace from "./Workspace";
import type { ChatMessage, MorphResponse } from "@/lib/schema";

interface SpeechRecognitionResultItem {
  isFinal: boolean;
  length: number;
  0: { transcript: string };
}
interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((e: { results: SpeechRecognitionResultItem[] }) => void) | null;
  onend: (() => void) | null;
}

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

const SAMPLE_PROMPTS = [
  "I'm not sure whether to switch jobs or stay. Help me think it through.",
  "Compare buying a car vs relying on public transport for the next year.",
  "Give me a 4-week plan to launch a small side project.",
];

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Mode>("reflective");
  const [prevMode, setPrevMode] = useState<Mode>("reflective");
  const [dashboardState, setDashboardState] = useState<any>({ widgets: [] });
  const [loading, setLoading] = useState(false);

  // Optional: subtle toast when mode changes
  const [modeToast, setModeToast] = useState<string | null>(null);

  // Voice: speech-to-text (client-only to avoid hydration mismatch)
  const [canUseSpeech, setCanUseSpeech] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const recognitionRef = useRef<{ start: () => void; stop: () => void } | null>(null);

  useEffect(() => {
    const supported =
      typeof window !== "undefined" &&
      !!((window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition ?? (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition);
    setCanUseSpeech(!!supported);
  }, []);

  useEffect(() => {
    if (!canUseSpeech) return;
    const Ctor = (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionInstance; webkitSpeechRecognition?: new () => SpeechRecognitionInstance }).SpeechRecognition ?? (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionInstance }).webkitSpeechRecognition;
    if (!Ctor) return;
    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    rec.onresult = (e: { results: SpeechRecognitionResultItem[] }) => {
      let interim = "";
      let final = "";
      for (const res of e.results) {
        const t = res[0]?.transcript ?? "";
        if (res.isFinal) final = final ? final + " " + t : t;
        else interim = interim ? interim + " " + t : t;
      }
      if (final) setInput((prev) => (prev ? prev + " " + final : final).trim());
      setInterimTranscript(interim);
    };
    rec.onend = () => {
      setIsListening(false);
      setInterimTranscript("");
    };
    recognitionRef.current = rec;
    return () => {
      try {
        rec.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    };
  }, [canUseSpeech]);

  function toggleListening() {
    const rec = recognitionRef.current;
    if (!rec) return;
    if (isListening) {
      rec.stop();
    } else {
      setInterimTranscript("");
      setIsListening(true);
      rec.start();
    }
  }

  const speechSynthRef = useRef<SpeechSynthesis | null>(null);
  const speakingRef = useRef(false);

  // Realtime voice (OpenAI Realtime API + Morph dashboard sync)
  type RealtimeStatus = "idle" | "connecting" | "connected" | "error";
  const [realtimeStatus, setRealtimeStatus] = useState<RealtimeStatus>("idle");
  const [realtimeError, setRealtimeError] = useState<string | null>(null);
  const realtimePcRef = useRef<RTCPeerConnection | null>(null);
  const realtimeDcRef = useRef<RTCDataChannel | null>(null);
  const realtimeMessagesRef = useRef<ChatMessage[]>([]);
  const realtimeStreamRef = useRef<MediaStream | null>(null);
  const dashboardStateRef = useRef(dashboardState);
  dashboardStateRef.current = dashboardState;
  const modeRef = useRef(mode);
  modeRef.current = mode;

  function extractItemText(item: { role?: string; content?: Array<{ text?: string; transcript?: string; type?: string }> }): string {
    if (!item.content?.length) return "";
    return item.content
      .map((c) => c.transcript ?? c.text ?? "")
      .filter(Boolean)
      .join(" ");
  }

  async function startRealtimeVoice() {
    setRealtimeError(null);
    setRealtimeStatus("connecting");
    realtimeMessagesRef.current = [];
    try {
      if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
        throw new Error("Microphone access is not available (use HTTPS or a supported browser).");
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      realtimeStreamRef.current = stream;
      const pc = new RTCPeerConnection();
      realtimePcRef.current = pc;

      const audioEl = document.createElement("audio");
      audioEl.autoplay = true;
      pc.ontrack = (e) => {
        audioEl.srcObject = e.streams[0];
      };

      pc.addTrack(stream.getTracks()[0]);
      const dc = pc.createDataChannel("oai-events");
      realtimeDcRef.current = dc;

      dc.addEventListener("open", () => setRealtimeStatus("connected"));
      dc.addEventListener("message", (e) => {
        try {
          const event = JSON.parse(e.data) as { type: string; item?: { role?: string; content?: Array<{ text?: string; transcript?: string; type?: string }> }; response?: { output?: Array<{ text?: string; transcript?: string }> } };
          if (event.type === "conversation.item.added" && event.item) {
            const role = event.item.role as "user" | "assistant" | undefined;
            if (role === "user" || role === "assistant") {
              const text = extractItemText(event.item);
              if (text) {
                const msg: ChatMessage = { role, content: text };
                realtimeMessagesRef.current = [...realtimeMessagesRef.current, msg];
                setMessages((prev) => [...prev, msg]);
              }
            }
          }
          if (event.type === "response.done" && event.response) {
            const out = event.response as { output?: Array<{ text?: string; transcript?: string; content?: Array<{ text?: string; transcript?: string }> }> };
            let assistantText = "";
            if (Array.isArray(out.output)) {
              assistantText = out.output
                .map((p) => p.transcript ?? p.text ?? (Array.isArray(p.content) ? p.content.map((c) => c.transcript ?? c.text ?? "").join(" ") : ""))
                .filter(Boolean)
                .join(" ")
                .trim();
            }
            if (assistantText) {
              const assistantMsg: ChatMessage = { role: "assistant", content: assistantText };
              realtimeMessagesRef.current = [...realtimeMessagesRef.current, assistantMsg];
              setMessages((prev) => [...prev, assistantMsg]);
            }
            const messagesForMorph = realtimeMessagesRef.current.slice(-20);
            if (messagesForMorph.length === 0) return;
            fetch("/api/morph", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ messages: messagesForMorph, dashboardState: dashboardStateRef.current }),
            })
              .then((res) => res.json())
              .then((data) => {
                if (data.mode) {
                  setPrevMode(modeRef.current);
                  setMode(data.mode);
                  setModeToast(`Switched to ${modeLabel(data.mode)}`);
                }
                if (data.dashboard) {
                  setDashboardState((prev: any) => {
                    if (!data.dashboard) return prev;
                    if (data.dashboard.action === "set") return { widgets: data.dashboard.widgets ?? [] };
                    const prevMap = new Map((prev.widgets ?? []).map((w: any) => [w.id, w]));
                    for (const w of data.dashboard.widgets ?? []) {
                      prevMap.set(w.id, { ...(prevMap.get(w.id) ?? {}), ...w });
                    }
                    const merged = Array.from(prevMap.values());
                    merged.sort((a: any, b: any) => (b.priority ?? 0) - (a.priority ?? 0) || String(a.id).localeCompare(String(b.id)));
                    return { widgets: merged };
                  });
                }
              })
              .catch(() => {});
          }
        } catch (_) {}
      });
      dc.addEventListener("close", () => setRealtimeStatus("idle"));
      dc.addEventListener("error", () => setRealtimeStatus("error"));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      const sdpBody = offer.sdp ?? "";
      const sdpRes = await fetch("/api/realtime/call", {
        method: "POST",
        headers: { "Content-Type": "application/sdp" },
        body: sdpBody,
      });
      if (!sdpRes.ok) {
        const err = await sdpRes.json().catch(() => ({}));
        throw new Error(err.error ?? "Realtime call failed");
      }
      const answerSdp = await sdpRes.text();
      await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });
    } catch (err) {
      setRealtimeError(err instanceof Error ? err.message : "Realtime failed");
      setRealtimeStatus("error");
      realtimeStreamRef.current?.getTracks().forEach((t) => t.stop());
      realtimeStreamRef.current = null;
      realtimePcRef.current = null;
      realtimeDcRef.current = null;
    }
  }

  function endRealtimeVoice() {
    try {
      realtimeStreamRef.current?.getTracks().forEach((t) => t.stop());
      realtimeStreamRef.current = null;
      realtimePcRef.current?.close();
    } catch (_) {
      // ignore
    }
    realtimePcRef.current = null;
    realtimeDcRef.current = null;
    setRealtimeStatus("idle");
    setRealtimeError(null);
  }

  function readAloud(text: string) {
    const safeText = typeof text === "string" ? text : "";
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
    } catch (_) {}
    const u = new SpeechSynthesisUtterance(safeText);
    u.lang = "en-US";
    u.rate = 0.95;
    u.pitch = 1;
    speechSynthRef.current = window.speechSynthesis;
    speakingRef.current = true;
    u.onend = () => {
      speakingRef.current = false;
    };
    window.speechSynthesis.speak(u);
  }

  function stopReading() {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      speakingRef.current = false;
    }
  }

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

  function startNewChat() {
    stopReading();
    if (isListening && recognitionRef.current) recognitionRef.current.stop();
    if (realtimeStatus !== "idle") endRealtimeVoice();
    setMessages([]);
    setInput("");
    setDashboardState({ widgets: [] });
    setMode("reflective");
    setPrevMode("reflective");
    setModeToast(null);
    setInterimTranscript("");
    setIsListening(false);
  }

  async function send(contentOverride?: string) {
    const text = (contentOverride ?? input).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = { role: "user", content: text };
    const nextMsgs = [...messages, userMsg];

    setMessages(nextMsgs);
    if (!contentOverride) setInput("");
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

            <div className="flex items-center gap-2 flex-wrap">
              {realtimeStatus === "idle" ? (
                <button
                  type="button"
                  onClick={() => {
                    startRealtimeVoice().catch((err) => {
                      setRealtimeError(err instanceof Error ? err.message : "Realtime failed");
                      setRealtimeStatus("error");
                    });
                  }}
                  className="rounded-full border border-emerald-600 bg-emerald-950/60 px-3 py-1.5 text-xs font-medium text-emerald-300 hover:bg-emerald-900/40 hover:text-emerald-200 transition-colors"
                >
                  Live talk
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    try {
                      endRealtimeVoice();
                    } catch (_) {
                      setRealtimeStatus("idle");
                      setRealtimeError(null);
                    }
                  }}
                  className="rounded-full border border-red-600/50 bg-red-950/40 px-3 py-1.5 text-xs font-medium text-red-300 hover:bg-red-900/40 transition-colors"
                >
                  End call
                </button>
              )}
              <button
                type="button"
                onClick={startNewChat}
                className="rounded-full border border-zinc-700 bg-zinc-900/80 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
              >
                New chat
              </button>
              {realtimeStatus === "connecting" && (
                <span className="text-xs text-zinc-400">Connecting…</span>
              )}
              {realtimeStatus === "connected" && (
                <span className="text-xs text-emerald-400">Listening…</span>
              )}
              {realtimeStatus === "error" && realtimeError && (
                <span className="text-xs text-red-400" title={realtimeError}>Realtime error</span>
              )}
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
            </div>
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
                      } ${m.role === "assistant" ? "flex items-start justify-between gap-2" : ""}`}
                    >
                      <span className="min-w-0 flex-1">{m.content}</span>
                      {m.role === "assistant" && (
                        <button
                          type="button"
                          onClick={() => readAloud(m.content ?? "")}
                          className="flex-shrink-0 rounded p-1 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 transition-colors"
                          title="Read aloud"
                          aria-label="Read aloud"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /></svg>
                        </button>
                      )}
                    </div>
                  ))}

                  {loading && (
                    <div className="mr-auto max-w-[85%] rounded-xl bg-zinc-800 px-4 py-3 text-sm">
                      <div className="flex items-center gap-1.5 text-zinc-400">
                        <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-zinc-500 [animation-delay:-0.3s]" />
                        <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-zinc-500 [animation-delay:-0.15s]" />
                        <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-zinc-500" />
                        <span className="ml-2 text-zinc-500">Thinking…</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {messages.length === 0 && (
                <div className="mt-2">
                  <div className="mb-2 text-xs text-zinc-500">Try this</div>
                  <div className="flex flex-wrap gap-2">
                    {SAMPLE_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => send(prompt)}
                        disabled={loading}
                        className="rounded-lg border border-zinc-700 bg-zinc-900/60 px-3 py-2 text-left text-xs text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800 hover:text-zinc-100 transition-colors disabled:opacity-50 disabled:pointer-events-none max-w-full"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {isListening && interimTranscript && (
                <div className="mt-2 text-xs text-zinc-500 italic">
                  Listening… {interimTranscript}
                </div>
              )}
              {realtimeStatus !== "idle" && (
                <p className="mt-2 text-xs text-emerald-400/80">Live talk active — speak to the agent; dashboard updates after each reply.</p>
              )}
              <div className="mt-4 flex gap-2 items-center">
                {realtimeStatus === "idle" && canUseSpeech && (
                  <button
                    type="button"
                    onClick={toggleListening}
                    disabled={loading}
                    className={`flex-shrink-0 rounded-xl p-2.5 transition-colors ${isListening ? "bg-red-500/20 text-red-400 border border-red-500/40" : "border border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"}`}
                    title={isListening ? "Stop listening" : "Start voice input"}
                    aria-label={isListening ? "Stop listening" : "Start voice input"}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>
                  </button>
                )}
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder={realtimeStatus !== "idle" ? "Live talk — use mic" : isListening ? "Speak…" : "Type here… (Ctrl+Enter to send)"}
                  className="flex-1 rounded-xl border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm outline-none focus:border-zinc-600"
                  readOnly={realtimeStatus !== "idle"}
                />
                <button
                  onClick={() => send()}
                  disabled={!canSend || realtimeStatus !== "idle"}
                  className="rounded-xl bg-zinc-200 px-4 py-2 text-sm font-medium text-zinc-900 disabled:opacity-40"
                >
                  Send
                </button>
              </div>
              {realtimeStatus === "idle" && canUseSpeech && (
                <p className="mt-1.5 text-xs text-zinc-500">
                  Use the mic to speak; click again to stop. Assistant replies have a speaker icon to read aloud.
                </p>
              )}
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
