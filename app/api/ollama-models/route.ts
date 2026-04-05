import { NextResponse } from "next/server";

export async function GET() {
  const host = process.env.OLLAMA_HOST || "http://localhost:11434";

  try {
    const res = await fetch(`${host}/api/tags`, { next: { revalidate: 0 } });

    if (!res.ok) {
      return NextResponse.json({ models: [], error: "OLLAMA_OFFLINE" });
    }

    const data = await res.json();
    // Return both the base name (stripped of :tag) and the full name
    // so the UI can match "llama3.2" even if Ollama stores it as "llama3.2:latest"
    const rawNames: string[] = (data.models ?? []).map((m: { name: string }) => m.name);
    const baseNames = rawNames.map((n) => n.replace(/:.*$/, ""));

    // Dedupe and combine so consumers can check either form
    const all = Array.from(new Set([...rawNames, ...baseNames]));

    return NextResponse.json({ models: all });
  } catch {
    return NextResponse.json({ models: [], error: "OLLAMA_OFFLINE" });
  }
}
