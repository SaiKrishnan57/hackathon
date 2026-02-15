import { NextResponse } from "next/server";

export const runtime = "nodejs";

const REALTIME_CALLS_URL = "https://api.openai.com/v1/realtime/calls";

const REALTIME_SESSION_CONFIG = {
  type: "realtime",
  model: "gpt-realtime",
  audio: {
    output: {
      voice: "marin" as const,
    },
  },
  instructions: [
    "You are Morph, a helpful voice assistant. The user is also using a visual dashboard that updates based on the conversation.",
    "Always speak and respond in English only.",
    "Keep every reply very brief: 1-2 short sentences only. No long explanations or paragraphs.",
    "You can be reflective (explore feelings and options), analytical (compare options), or planning (next steps and timelines).",
  ].join(" "),
};

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OPENAI_API_KEY not set" }, { status: 500 });
  }

  let sdpOffer: string;
  try {
    sdpOffer = await req.text();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const formData = new FormData();
  formData.set("sdp", sdpOffer);
  formData.set("session", JSON.stringify(REALTIME_SESSION_CONFIG));

  const response = await fetch(REALTIME_CALLS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("OpenAI Realtime /calls error:", response.status, errText);
    return NextResponse.json(
      { error: "Realtime call failed", details: errText },
      { status: response.status }
    );
  }

  const sdpAnswer = await response.text();
  return new NextResponse(sdpAnswer, {
    headers: { "Content-Type": "application/sdp" },
  });
}
