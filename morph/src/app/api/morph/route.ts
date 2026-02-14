import { NextResponse } from "next/server";
import { MorphResponseSchema, ChatMessage } from "@/lib/schema";
import { SYSTEM_PROMPT } from "@/lib/prompt";

export const runtime = "nodejs";

type ReqBody = { messages: ChatMessage[] };

function safeJsonParse(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const body = (await req.json()) as ReqBody;
  const messages = (body.messages ?? []).slice(-10);

  const payload = {
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
    temperature: 0.4,
    response_format: { type: "json_object" }
  };

  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!resp.ok) {
    const errText = await resp.text();
    return NextResponse.json({ error: errText }, { status: 500 });
  }

  const data = await resp.json();
  const text = data?.choices?.[0]?.message?.content ?? "";

  const json = safeJsonParse(text);
  if (!json) {
    console.log("Invalid JSON from model:", text);
    return NextResponse.json({ error: "Invalid JSON from model", raw: text }, { status: 500 });
  }

  const parsed = MorphResponseSchema.safeParse(json);
  if (!parsed.success) {
    console.log("Schema invalid:", parsed.error.issues);
    console.log("Raw JSON:", json);
    return NextResponse.json(
      { error: "Schema invalid", issues: parsed.error.issues, raw: json },
      { status: 500 }
    );
  }

  return NextResponse.json(parsed.data);
}
