# Morph – AI Dashboard Engine

Morph is a conversational dashboard: you talk or type, and the right-hand panel becomes your dashboard. It adapts to **three modes** — **Reflective** (explore, clarify), **Analytical** (compare options, numbers, charts), and **Planning** (steps, timeline) — and updates in real time as the conversation evolves.

---

## Setup (for judges / local run)

### Prerequisites

- **Node.js** 18+ and **npm** (or yarn/pnpm)
- **OpenAI API key** (required for chat, dashboard, and Live talk)

### 1. Clone and install

```bash
cd morph
npm install
```

### 2. Environment variables

Copy the example env file and add your OpenAI API key:

```bash
cp .env.example .env
```

Edit `.env` and set:

- **`OPENAI_API_KEY`** (required) – Your OpenAI API key from [platform.openai.com/api-keys](https://platform.openai.com/api-keys). Used for the Morph API (chat + dashboard) and for Live talk (realtime voice).

Optional:

- **`OPENAI_MODEL`** – Model for chat/dashboard (default: `gpt-4o-mini`). Leave unset or set to e.g. `gpt-4o-mini` or `gpt-4o`.

**Important:** Do not commit `.env` or put a real API key in `.env.example`. The repo should only contain `.env.example` with placeholders.

### 3. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Quick check

- **Chat:** Type a message or click a "Try this" sample prompt. The right panel should show the dashboard (brief, assumptions, etc.) and the mode (Reflective / Analytical / Planning) should update.
- **Live talk:** Click the mic to start a voice call. You need microphone access and a supported browser (Chrome/Edge recommended). The same dashboard updates from voice.

---

## Config summary

| Variable          | Required | Description |
|-------------------|----------|-------------|
| `OPENAI_API_KEY`  | Yes      | OpenAI API key for Morph API + Live talk |
| `OPENAI_MODEL`    | No       | Model for chat/dashboard (default: `gpt-4o-mini`) |

No database or other services are required. Everything runs locally with the Next.js dev server and OpenAI API.

---

## Demo

See **DEMO_SCRIPT.md** for a presenter script and **DEMO.md** for the three use cases (Reflective, Analytical, Planning).

---

## Tech stack

- Next.js 16, React 19, TypeScript
- Tailwind CSS, Framer Motion
- OpenAI API (chat/completions + Realtime for voice)
- Recharts (analytical charts)
