import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

// ── Friendly error messages ──────────────────────────────────
function friendlyError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);

  if (msg.includes("credit balance is too low") || msg.includes("insufficient_quota"))
    return "OUT_OF_CREDITS";
  if (msg.includes("invalid_api_key") || msg.includes("Incorrect API key"))
    return "INVALID_KEY";
  if (msg.includes("rate_limit") || msg.includes("rate limit"))
    return "RATE_LIMITED";

  return msg;
}

// ── Claude (Anthropic) ───────────────────────────────────────
async function callClaude(
  messages: { role: string; content: string }[],
  systemPrompt: string
) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY not set in .env.local");
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: systemPrompt || "You are a helpful AI assistant.",
    messages: messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  });

  const content = response.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type");
  return content.text;
}

// ── GPT (OpenAI) ─────────────────────────────────────────────
async function callGPT(
  messages: { role: string; content: string }[],
  systemPrompt: string
) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY not set in .env.local");
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt || "You are a helpful AI assistant." },
      ...messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ],
    max_tokens: 4096,
  });

  return response.choices[0]?.message?.content ?? "";
}

// ── Main handler ─────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const { messages, systemPrompt, ai } = await request.json();

    let content: string;

    if (ai === "GPT") {
      content = await callGPT(messages, systemPrompt);
    } else if (ai === "Claude") {
      content = await callClaude(messages, systemPrompt);
    } else {
      // Gemini — coming soon
      return NextResponse.json(
        { error: "COMING_SOON" },
        { status: 400 }
      );
    }

    return NextResponse.json({ content });
  } catch (err) {
    console.error("AI API error:", err);
    return NextResponse.json(
      { error: friendlyError(err) },
      { status: 500 }
    );
  }
}
