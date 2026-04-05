import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

// ── Ollama: resolve the exact model name Ollama knows about ──

async function resolveOllamaModel(modelId: string): Promise<string> {
  const host = process.env.OLLAMA_HOST || "http://localhost:11434";
  try {
    const res  = await fetch(`${host}/api/tags`);
    if (!res.ok) return modelId; // server offline — let it fail naturally
    const data = await res.json();
    const names: string[] = (data.models ?? []).map((m: { name: string }) => m.name);

    // Exact match first
    if (names.includes(modelId)) return modelId;
    // Try with :latest suffix
    if (names.includes(`${modelId}:latest`)) return `${modelId}:latest`;
    // Partial match (e.g. "llama3.2" matches "llama3.2:instruct")
    const partial = names.find((n) => n.startsWith(`${modelId}:`));
    if (partial) return partial;

    // Nothing found — return as-is so the 404 surfaces cleanly
    return modelId;
  } catch {
    return modelId;
  }
}

// ── Provider configs keyed by model prefix ───────────────────

async function getOpenAIClient(modelId: string): Promise<{ client: OpenAI; model: string } | null> {
  // Ollama — all models that don't match a cloud prefix go here
  if (isOllamaModel(modelId)) {
    const host         = process.env.OLLAMA_HOST || "http://localhost:11434";
    const resolvedModel = await resolveOllamaModel(modelId);
    return {
      client: new OpenAI({ baseURL: `${host}/v1`, apiKey: "ollama" }),
      model: resolvedModel,
    };
  }

  // OpenAI (GPT)
  if (modelId.startsWith("gpt-") || modelId.startsWith("o1") || modelId.startsWith("o3")) {
    if (!process.env.OPENAI_API_KEY)
      throw new Error("OPENAI_API_KEY not set in .env.local");
    return {
      client: new OpenAI({ apiKey: process.env.OPENAI_API_KEY }),
      model: modelId,
    };
  }

  // Google Gemini — uses an OpenAI-compatible endpoint
  if (modelId.startsWith("gemini-")) {
    if (!process.env.GEMINI_API_KEY)
      throw new Error("GEMINI_API_KEY not set in .env.local");
    return {
      client: new OpenAI({
        baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
        apiKey: process.env.GEMINI_API_KEY,
      }),
      model: modelId,
    };
  }

  return null;
}

function isOllamaModel(modelId: string): boolean {
  return (
    !modelId.startsWith("gpt-")     &&
    !modelId.startsWith("o1")       &&
    !modelId.startsWith("o3")       &&
    !modelId.startsWith("gemini-")  &&
    !modelId.startsWith("claude-")
  );
}

// ── Unified chat call ────────────────────────────────────────

async function chat(
  modelId: string,
  messages: { role: string; content: string }[],
  systemPrompt: string
): Promise<string> {

  // ── Anthropic (Claude) — different API format ────────────
  if (modelId.startsWith("claude-")) {
    if (!process.env.ANTHROPIC_API_KEY)
      throw new Error("ANTHROPIC_API_KEY not set in .env.local");

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const res = await client.messages.create({
      model: modelId,
      max_tokens: 4096,
      system: systemPrompt || "You are a helpful AI assistant.",
      messages: messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });
    const content = res.content[0];
    if (content.type !== "text") throw new Error("Unexpected response type");
    return content.text;
  }

  // ── Everything else via OpenAI-compatible endpoint ────────
  const config = await getOpenAIClient(modelId);
  if (!config) throw new Error(`Unknown model: ${modelId}`);

  const { client, model } = config;
  const res = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemPrompt || "You are a helpful AI assistant." },
      ...messages.map((m) => ({
        role:    m.role    as "user" | "assistant",
        content: m.content as string,
      })),
    ],
    max_tokens: 4096,
  });

  return res.choices[0]?.message?.content ?? "";
}

// ── Friendly error messages ───────────────────────────────────

function friendlyError(err: unknown, modelId?: string): string {
  const msg    = err instanceof Error ? err.message : String(err);
  const status = (err as { status?: number })?.status;

  if (msg.includes("credit balance is too low") || msg.includes("insufficient_quota"))
    return "OUT_OF_CREDITS";
  if (msg.includes("invalid_api_key") || msg.includes("Incorrect API key") || msg.includes("API_KEY_INVALID"))
    return "INVALID_KEY";
  if (msg.includes("rate_limit") || msg.includes("RATE_LIMIT"))
    return "RATE_LIMITED";
  if (msg.includes("ECONNREFUSED") || msg.includes("fetch failed") || (msg.includes("localhost") && status !== 404))
    return "OLLAMA_OFFLINE";
  if (status === 404 && modelId)
    return `OLLAMA_MODEL_NOT_FOUND:${modelId}`;
  if (msg.includes("not found") && modelId)
    return `OLLAMA_MODEL_NOT_FOUND:${modelId}`;
  if (msg.includes("not set in .env"))
    return msg;

  return msg;
}

// ── Route handler ─────────────────────────────────────────────

export async function POST(request: NextRequest) {
  let model: string | undefined;

  try {
    const body = await request.json();
    model = body.model;
    const { messages, systemPrompt } = body;

    if (!model) {
      return NextResponse.json({ error: "No model specified." }, { status: 400 });
    }

    const content = await chat(model, messages, systemPrompt);
    return NextResponse.json({ content });
  } catch (err) {
    console.error("AI API error:", err);
    return NextResponse.json({ error: friendlyError(err, model) }, { status: 500 });
  }
}
