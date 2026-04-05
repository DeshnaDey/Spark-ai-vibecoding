"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Project,
  ALL_MODELS,
  ChatMessage,
  getProject,
  saveProject,
  getChatHistory,
  saveChatHistory,
  getAIColor,
  getModelConfig,
} from "@/lib/storage";
import FloorNav from "@/components/FloorNav";
import ChatInterface from "@/components/ChatInterface";
import AIBadge from "@/components/AIBadge";

type Floor = "Context" | "Chat" | "Files" | "History";

const LOCAL_MODELS = ALL_MODELS.filter((m) => m.provider === "ollama");
const CLOUD_MODELS = ALL_MODELS.filter((m) => m.provider !== "ollama");

export default function ProjectPage() {
  const params    = useParams();
  const router    = useRouter();
  const projectId = params.id as string;

  const [project, setProject]       = useState<Project | null>(null);
  const [activeFloor, setActiveFloor] = useState<Floor>("Chat");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isEditing, setIsEditing]   = useState(false);
  const [editedDesc, setEditedDesc] = useState("");
  const [isMounted, setIsMounted]   = useState(false);
  const [showModelPicker, setShowModelPicker] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const p = getProject(projectId);
    if (!p) { router.push("/"); return; }
    setProject(p);
    setEditedDesc(p.description);
    setChatHistory(getChatHistory(projectId));
  }, [projectId]);

  const handleChatHistoryUpdate = (messages: ChatMessage[]) => {
    setChatHistory(messages);
    saveChatHistory(projectId, messages);
  };

  const handleModelSwitch = (modelId: string) => {
    if (!project) return;
    const updated = { ...project, ai: modelId };
    setProject(updated);
    saveProject(updated);
    setShowModelPicker(false);
  };

  const handleSaveDescription = () => {
    if (!project) return;
    const updated = { ...project, description: editedDesc };
    setProject(updated);
    saveProject(updated);
    setIsEditing(false);
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex gap-2">
          <div className="typing-dot" style={{ background: "#f5a623" }} />
          <div className="typing-dot" style={{ background: "#f5a623" }} />
          <div className="typing-dot" style={{ background: "#f5a623" }} />
        </div>
      </div>
    );
  }

  if (!project) return null;

  const color       = getAIColor(project.ai);
  const modelConfig = getModelConfig(project.ai);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        height: "100vh",
        background: "radial-gradient(ellipse at 15% 50%, rgba(155,93,229,0.06) 0%, transparent 60%), radial-gradient(ellipse at 85% 30%, rgba(245,166,35,0.04) 0%, transparent 50%), var(--bg-void)",
      }}
    >
      {/* ── TOP BAR ──────────────────────────────── */}
      <header
        className="flex items-center gap-4 px-6 py-4 border-b flex-shrink-0"
        style={{ borderColor: "var(--border-subtle)", background: "rgba(13,13,15,0.8)", backdropFilter: "blur(8px)" }}
      >
        <button
          onClick={() => router.push("/")}
          className="font-mono text-xs text-[var(--text-dim)] hover:text-[var(--neon-amber)] transition-colors duration-150 flex items-center gap-1.5 flex-shrink-0"
        >
          ← City
        </button>
        <div className="h-4 w-px flex-shrink-0" style={{ background: "var(--border-subtle)" }} />
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-display font-bold text-base truncate neon-amber">{project.name}</span>
          <span className="font-mono text-[10px] text-[var(--text-dim)] flex-shrink-0 hidden sm:block">#{projectId.slice(0, 6)}</span>
        </div>

        {/* Model switcher */}
        <div className="ml-auto flex-shrink-0 relative">
          <button
            onClick={() => setShowModelPicker((v) => !v)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-xs font-semibold border transition-all duration-200"
            style={{
              background: `${color}12`, borderColor: `${color}40`, color,
              boxShadow: showModelPicker ? `0 0 16px ${color}30` : "none",
            }}
          >
            <span>{modelConfig.icon}</span>
            <span className="hidden sm:block">{modelConfig.label}</span>
            <span className="opacity-50">▾</span>
          </button>
          {showModelPicker && (
            <div
              className="absolute right-0 top-full mt-2 w-64 rounded-xl border p-3 z-50 space-y-3"
              style={{ background: "var(--bg-card)", borderColor: "var(--border-card)", boxShadow: "0 8px 30px rgba(0,0,0,0.5)" }}
            >
              <ModelPickerSection title="⬡ Local (Ollama)" models={LOCAL_MODELS} current={project.ai} onSelect={handleModelSwitch} />
              <div className="h-px" style={{ background: "var(--border-subtle)" }} />
              <ModelPickerSection title="☁ Cloud" models={CLOUD_MODELS} current={project.ai} onSelect={handleModelSwitch} />
            </div>
          )}
        </div>
      </header>

      {/* ── MAIN LAYOUT ─────────────────────────── */}
      <div className="flex flex-1 min-h-0 gap-0">

        {/* ── BUILDING SIDEBAR ─────────────────── */}
        <aside
          className="w-[130px] flex-shrink-0 flex flex-col justify-between py-6 px-2"
          style={{ background: "transparent" }}
        >
          {/* Building + floor nav */}
          <FloorNav
            floors={project.floors}
            activeFloor={activeFloor}
            onFloorChange={(f) => setActiveFloor(f as Floor)}
            projectName={project.name}
            modelId={project.ai}
          />
        </aside>

        {/* ── MAIN CONTENT — floating card ─────── */}
        <main className="flex-1 min-h-0 flex flex-col p-4 pl-2">
          {/* Floating content panel */}
          <div
            className="flex-1 min-h-0 flex flex-col rounded-2xl overflow-hidden"
            style={{
              border: `1px solid ${color}20`,
              background: "var(--bg-panel)",
              boxShadow: `0 0 40px ${color}08, 0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)`,
            }}
          >
            {/* Floor header */}
            <div
              className="flex items-center justify-between px-5 py-3 border-b flex-shrink-0"
              style={{ borderColor: `${color}15`, background: `${color}06` }}
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs uppercase tracking-widest" style={{ color }}>▸ Floor</span>
                <span className="font-display font-semibold text-sm text-[var(--text-primary)]">{activeFloor}</span>
              </div>
              <AIBadge modelId={project.ai} size="sm" />
            </div>

          <div className="flex-1 min-h-0 overflow-hidden">
            {activeFloor === "Context" && (
              <ContextFloor
                project={project}
                isEditing={isEditing}
                editedDesc={editedDesc}
                onEditStart={() => setIsEditing(true)}
                onEditCancel={() => { setIsEditing(false); setEditedDesc(project.description); }}
                onDescChange={setEditedDesc}
                onSave={handleSaveDescription}
              />
            )}
            {activeFloor === "Chat" && (
              <div className="h-full p-4">
                <ChatInterface
                  projectId={projectId}
                  systemPrompt={project.description}
                  modelId={project.ai}
                  initialHistory={chatHistory}
                  onHistoryUpdate={handleChatHistoryUpdate}
                />
              </div>
            )}
            {activeFloor === "Files"   && <FilesFloor />}
            {activeFloor === "History" && <HistoryFloor history={chatHistory} modelId={project.ai} />}
                   </div>
        </div> {/* end floating panel */}
        </main>
      </div>
    </div>
  );
}

// ── Inline model picker used in the dropdown ──────────────

function ModelPickerSection({
  title,
  models,
  current,
  onSelect,
}: {
  title: string;
  models: typeof ALL_MODELS;
  current: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div>
      <div className="font-mono text-[10px] text-[var(--text-dim)] uppercase tracking-widest mb-2">{title}</div>
      <div className="space-y-1">
        {models.map((m) => {
          const isActive = current === m.id;
          return (
            <button
              key={m.id}
              onClick={() => onSelect(m.id)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all duration-150"
              style={{
                background: isActive ? `${m.color}15` : "transparent",
                color: isActive ? m.color : "var(--text-secondary)",
              }}
            >
              <span className="text-sm flex-shrink-0">{m.icon}</span>
              <div className="min-w-0">
                <div className="font-mono text-xs font-semibold truncate">{m.label}</div>
                <div className="font-mono text-[10px] text-[var(--text-dim)] truncate">{m.description}</div>
              </div>
              {isActive && <span className="ml-auto text-xs flex-shrink-0" style={{ color: m.color }}>✓</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Context floor ─────────────────────────────────────────

function ContextFloor({
  project, isEditing, editedDesc,
  onEditStart, onEditCancel, onDescChange, onSave,
}: {
  project: Project; isEditing: boolean; editedDesc: string;
  onEditStart: () => void; onEditCancel: () => void;
  onDescChange: (v: string) => void; onSave: () => void;
}) {
  const color  = getAIColor(project.ai);
  const config = getModelConfig(project.ai);
  const createdAt = new Date(project.createdAt);

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto space-y-6 animate-slide-in-up">
        <div className="glow-card p-6" style={{ borderColor: `${color}30` }}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="font-display font-bold text-xl text-[var(--text-primary)]">{project.name}</h2>
              <p className="font-mono text-xs text-[var(--text-dim)] mt-1">
                Created {createdAt.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
            <AIBadge modelId={project.ai} size="md" />
          </div>
          <div className="h-px bg-[var(--border-subtle)] mb-4" />
          <div className="mb-4">
            <label className="font-mono text-xs text-[var(--text-dim)] uppercase tracking-widest block mb-2">Project Context</label>
            {isEditing ? (
              <div className="space-y-3">
                <textarea
                  value={editedDesc}
                  onChange={(e) => onDescChange(e.target.value)}
                  className="w-full min-h-[120px] resize-none bg-[var(--bg-input)] rounded-xl border border-[rgba(245,166,35,0.3)] p-4 font-mono text-sm text-[var(--text-primary)] outline-none focus:border-[rgba(245,166,35,0.6)] transition-colors"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button onClick={onSave} className="neon-btn neon-btn-amber px-5 py-2 text-sm">Save Context</button>
                  <button onClick={onEditCancel} className="px-5 py-2 rounded-lg font-mono text-sm border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-card)] transition-colors">Cancel</button>
                </div>
              </div>
            ) : (
              <div>
                <p className="font-mono text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">{project.description}</p>
                <button onClick={onEditStart} className="mt-3 font-mono text-xs text-[var(--text-dim)] hover:text-[var(--neon-amber)] transition-colors border border-[var(--border-subtle)] hover:border-[rgba(245,166,35,0.3)] rounded-lg px-3 py-1.5">
                  ✎ Edit Context
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Model", value: config.label, color },
            { label: "Provider", value: config.provider.charAt(0).toUpperCase() + config.provider.slice(1), color: "#9b5de5" },
            { label: "Project ID", value: `#${project.id.slice(0, 6)}`, color: "#555570" },
          ].map(({ label, value, color: c }) => (
            <div key={label} className="glow-card p-4 text-center" style={{ borderColor: `${c}20` }}>
              <div className="font-mono text-xs text-[var(--text-dim)] mb-1">{label}</div>
              <div className="font-display font-semibold text-sm" style={{ color: c }}>{value}</div>
            </div>
          ))}
        </div>

        <div className="glow-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-mono text-xs text-[var(--text-dim)] uppercase tracking-widest">System Prompt Preview</span>
            <span className="font-mono text-[10px] text-[var(--neon-green)] border border-[rgba(57,255,20,0.3)] rounded-full px-2 py-0.5">live</span>
          </div>
          <div className="rounded-xl p-4 font-mono text-xs leading-relaxed text-[var(--text-secondary)] border" style={{ background: "var(--bg-input)", borderColor: "var(--border-subtle)" }}>
            <span className="text-[var(--neon-green)]">SYSTEM: </span>
            You are an AI assistant helping with the following project:
            <br /><br />
            <span className="text-[var(--neon-amber)]">{project.description}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Files floor ───────────────────────────────────────────

function FilesFloor() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 gap-6 opacity-50">
      <div className="text-5xl">▦</div>
      <div className="text-center">
        <h3 className="font-display font-semibold text-[var(--text-secondary)] mb-2">Files Floor</h3>
        <p className="font-mono text-sm text-[var(--text-dim)] max-w-xs">File attachments coming soon. 🏗</p>
      </div>
      <div className="border border-dashed border-[rgba(155,93,229,0.3)] rounded-xl w-48 h-24 flex items-center justify-center">
        <span className="font-mono text-xs text-[var(--text-dim)]">Drop files here</span>
      </div>
    </div>
  );
}

// ── History floor ─────────────────────────────────────────

function HistoryFloor({ history, modelId }: { history: ChatMessage[]; modelId: string }) {
  const color        = getAIColor(modelId);
  const userMessages = history.filter((m) => m.role === "user");

  if (!userMessages.length) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 opacity-40">
        <div className="text-4xl">◷</div>
        <p className="font-mono text-sm text-[var(--text-dim)]">No history yet. Head to the Chat floor.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto">
        <div className="font-mono text-xs text-[var(--text-dim)] uppercase tracking-widest mb-4">
          {userMessages.length} prompt{userMessages.length !== 1 ? "s" : ""} sent
        </div>
        <div className="space-y-3">
          {userMessages.map((msg, i) => (
            <div key={i} className="glow-card p-4 flex items-start gap-3" style={{ borderColor: `${color}15` }}>
              <div className="font-mono text-xs text-[var(--text-dim)] flex-shrink-0 mt-0.5 w-5 text-right">{userMessages.length - i}</div>
              <div className="flex-1 min-w-0">
                <p className="font-mono text-sm text-[var(--text-secondary)] line-clamp-2">{msg.content}</p>
                <p className="font-mono text-[10px] text-[var(--text-dim)] mt-1.5">{new Date(msg.timestamp).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
