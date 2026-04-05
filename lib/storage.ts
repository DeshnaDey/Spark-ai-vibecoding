// ============================================================
// SPARK.AI — Storage & Model Registry
// ============================================================

// ── Model Registry ───────────────────────────────────────────

export interface ModelConfig {
  id: string;
  label: string;
  provider: "ollama" | "openai" | "anthropic" | "google";
  color: string;
  icon: string;
  requiresKey: boolean;
  envKey?: string;          // which .env.local key is needed
  description: string;
}

export const ALL_MODELS: ModelConfig[] = [
  // ── Local via Ollama (free, no key) ──────────────────────
  {
    id: "llama3.2",
    label: "Llama 3.2",
    provider: "ollama",
    color: "#ff2d78",
    icon: "⬡",
    requiresKey: false,
    description: "Meta's fast general-purpose model. ~2GB.",
  },
  {
    id: "mistral",
    label: "Mistral",
    provider: "ollama",
    color: "#ff2d78",
    icon: "⬡",
    requiresKey: false,
    description: "Great at coding and reasoning. ~4GB.",
  },
  {
    id: "deepseek-r1",
    label: "DeepSeek R1",
    provider: "ollama",
    color: "#ff2d78",
    icon: "⬡",
    requiresKey: false,
    description: "Strong reasoning model. ~4GB.",
  },
  {
    id: "codellama",
    label: "CodeLlama",
    provider: "ollama",
    color: "#ff2d78",
    icon: "⬡",
    requiresKey: false,
    description: "Specialised for code generation. ~4GB.",
  },
  {
    id: "gemma3",
    label: "Gemma 3",
    provider: "ollama",
    color: "#ff2d78",
    icon: "⬡",
    requiresKey: false,
    description: "Google's open-source model. ~3GB.",
  },
  // ── Cloud via API key ─────────────────────────────────────
  {
    id: "gpt-4o",
    label: "GPT-4o",
    provider: "openai",
    color: "#39ff14",
    icon: "⚡",
    requiresKey: true,
    envKey: "OPENAI_API_KEY",
    description: "OpenAI's flagship multimodal model.",
  },
  {
    id: "gpt-4o-mini",
    label: "GPT-4o Mini",
    provider: "openai",
    color: "#39ff14",
    icon: "⚡",
    requiresKey: true,
    envKey: "OPENAI_API_KEY",
    description: "Faster, cheaper OpenAI model.",
  },
  {
    id: "claude-sonnet-4-20250514",
    label: "Claude Sonnet",
    provider: "anthropic",
    color: "#f5a623",
    icon: "◈",
    requiresKey: true,
    envKey: "ANTHROPIC_API_KEY",
    description: "Anthropic's best balance of speed and intelligence.",
  },
  {
    id: "gemini-2.0-flash",
    label: "Gemini Flash",
    provider: "google",
    color: "#4fc3f7",
    icon: "✦",
    requiresKey: true,
    envKey: "GEMINI_API_KEY",
    description: "Google's fast multimodal model.",
  },
];

export type AIModel = string; // model ID from ALL_MODELS, or any custom Ollama model name

export function getModelConfig(modelId: string): ModelConfig {
  return (
    ALL_MODELS.find((m) => m.id === modelId) ?? {
      id: modelId,
      label: modelId,
      provider: "ollama",
      color: "#ff2d78",
      icon: "⬡",
      requiresKey: false,
      description: "Custom Ollama model.",
    }
  );
}

export function getAIColor(modelId: string): string {
  return getModelConfig(modelId).color;
}

// ── Project & Chat types ─────────────────────────────────────

export interface Project {
  id: string;
  name: string;
  description: string;
  ai: AIModel;       // model ID
  createdAt: string;
  floors: string[];
}

export interface ChatMessage {
  role: "user" | "assistant" | "error";
  content: string;
  timestamp: string;
}

// ── localStorage helpers ─────────────────────────────────────

const PROJECTS_KEY = "spark_projects";
const CHAT_PREFIX  = "spark_chat_";

export function getProjects(): Project[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PROJECTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveProject(project: Project): void {
  if (typeof window === "undefined") return;
  const projects = getProjects();
  const idx = projects.findIndex((p) => p.id === project.id);
  if (idx >= 0) projects[idx] = project;
  else projects.unshift(project);
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

export function getProject(id: string): Project | null {
  return getProjects().find((p) => p.id === id) ?? null;
}

export function deleteProject(id: string): void {
  if (typeof window === "undefined") return;
  const projects = getProjects().filter((p) => p.id !== id);
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  localStorage.removeItem(CHAT_PREFIX + id);
}

export function getChatHistory(projectId: string): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CHAT_PREFIX + projectId);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveChatHistory(projectId: string, messages: ChatMessage[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CHAT_PREFIX + projectId, JSON.stringify(messages));
}

export function appendChatMessage(projectId: string, message: ChatMessage): void {
  const history = getChatHistory(projectId);
  history.push(message);
  saveChatHistory(projectId, history);
}

export function createNewProject(description: string, ai: AIModel): Project {
  const words = description.trim().split(/\s+/).slice(0, 4);
  const name  = words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  return {
    id: crypto.randomUUID(),
    name: name || "Untitled Project",
    description: description.trim(),
    ai,
    createdAt: new Date().toISOString(),
    floors: ["Context", "Chat", "Files", "History"],
  };
}
