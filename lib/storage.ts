// ============================================================
// SPARK.AI — localStorage Persistence Layer
// ============================================================

export type AIModel = "GPT" | "Claude" | "Gemini";

export interface Project {
  id: string;
  name: string;
  description: string;
  ai: AIModel;
  createdAt: string;
  floors: string[];
}

export interface ChatMessage {
  role: "user" | "assistant" | "error";
  content: string;
  timestamp: string;
}

const PROJECTS_KEY = "spark_projects";
const CHAT_PREFIX  = "spark_chat_";

// ---- Projects ----

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
  if (idx >= 0) {
    projects[idx] = project;
  } else {
    projects.unshift(project);
  }
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

// ---- Chat History ----

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

// ---- Helpers ----

export function createNewProject(
  description: string,
  ai: AIModel
): Project {
  const words = description.trim().split(/\s+/).slice(0, 4);
  const name = words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  return {
    id: crypto.randomUUID(),
    name: name || "Untitled Project",
    description: description.trim(),
    ai,
    createdAt: new Date().toISOString(),
    floors: ["Context", "Chat", "Files", "History"],
  };
}

export function getAIColor(ai: AIModel): string {
  switch (ai) {
    case "GPT":    return "#39ff14";
    case "Claude": return "#f5a623";
    case "Gemini": return "#4fc3f7";
    default:       return "#9b5de5";
  }
}
