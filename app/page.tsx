"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Project,
  ALL_MODELS,
  ModelConfig,
  getProjects,
  saveProject,
  createNewProject,
  getAIColor,
  getModelConfig,
} from "@/lib/storage";
import BuildingCard, { NewProjectCard } from "@/components/BuildingCard";
import AIBadge from "@/components/AIBadge";

// Group models for the picker
const LOCAL_MODELS  = ALL_MODELS.filter((m) => m.provider === "ollama");
const CLOUD_MODELS  = ALL_MODELS.filter((m) => m.provider !== "ollama");

export default function Home() {
  const router = useRouter();
  const [projects, setProjects]         = useState<Project[]>([]);
  const [description, setDescription]   = useState("");
  const [selectedModel, setSelectedModel] = useState<string>("llama3.2");
  const [isMounted, setIsMounted]       = useState(false);
  const [isCreating, setIsCreating]     = useState(false);
  const [installedModels, setInstalledModels] = useState<string[] | null>(null);

  useEffect(() => {
    setIsMounted(true);
    setProjects(getProjects());
    // Check which Ollama models are installed
    fetch("/api/ollama-models")
      .then((r) => r.json())
      .then((d) => setInstalledModels(d.models ?? []))
      .catch(() => setInstalledModels([]));
  }, []);

  const handleCreate = () => {
    const trimmed = description.trim();
    if (!trimmed || isCreating) return;
    try {
      setIsCreating(true);
      const project = createNewProject(trimmed, selectedModel);
      saveProject(project);
      router.push(`/project/${project.id}`);
    } catch (err) {
      console.error("Failed to create project:", err);
      setIsCreating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleCreate();
    }
  };

  const handleNewProjectClick = () => {
    document.getElementById("create-section")?.scrollIntoView({ behavior: "smooth" });
    document.getElementById("project-desc-input")?.focus();
  };

  const selectedConfig = getModelConfig(selectedModel);
  const selectedColor  = getAIColor(selectedModel);

  return (
    <main className="min-h-screen flex flex-col overflow-hidden">

      {/* ── TOP BAR ────────────────────────────────── */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-[var(--border-subtle)] flex-shrink-0">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-base font-bold border"
            style={{ background: "rgba(245,166,35,0.1)", borderColor: "rgba(245,166,35,0.4)", color: "#f5a623", boxShadow: "0 0 12px rgba(245,166,35,0.3)" }}
          >
            ⚡
          </div>
          <span className="font-display font-bold text-xl tracking-tight neon-amber" style={{ letterSpacing: "-0.02em" }}>
            SPARK.AI
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-[var(--text-dim)]">
            {isMounted ? projects.length : 0} project{projects.length !== 1 ? "s" : ""}
          </span>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────── */}
      <section className="flex flex-col items-center pt-16 pb-12 px-6 text-center flex-shrink-0">
        <div className="space-y-3 mb-10">
          <h1 className="font-display font-bold text-5xl md:text-6xl tracking-tight neon-amber animate-flicker" style={{ lineHeight: 1.1 }}>
            SPARK.AI
          </h1>
          <p className="font-mono text-[var(--text-secondary)] text-base md:text-lg max-w-md mx-auto">
            Build once.{" "}
            <span className="text-[var(--neon-purple)]">Prompt everywhere.</span>
          </p>
          <p className="font-mono text-[var(--text-dim)] text-sm max-w-sm mx-auto">
            Define your project context once — then use any AI model from a single workspace.
          </p>
        </div>

        {/* ── CREATE PROJECT CARD ─────────────────── */}
        <div
          id="create-section"
          className="glow-card glow-card-amber w-full max-w-2xl p-8 animate-slide-in-up"
        >
          <div className="flex items-center gap-2 mb-5">
            <span className="font-mono text-xs font-semibold uppercase tracking-widest" style={{ color: "#f5a623" }}>
              ▸ New Project
            </span>
          </div>

          {/* Description */}
          <textarea
            id="project-desc-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your project... (e.g. A SaaS dashboard for fitness goals with AI-powered insights)"
            className="w-full min-h-[90px] max-h-[200px] resize-none bg-[var(--bg-input)] rounded-xl border border-[var(--border-subtle)] p-4 font-mono text-sm text-[var(--text-primary)] placeholder:text-[var(--text-dim)] outline-none transition-all duration-200 focus:border-[rgba(245,166,35,0.4)] focus:shadow-[0_0_20px_rgba(245,166,35,0.1)] leading-relaxed"
            rows={3}
          />

          {/* Model Selector */}
          <div className="mt-5 mb-6">
            <ModelGroup
              title="⬡ Local via Ollama"
              subtitle="Free · No API key · Runs on your machine"
              models={LOCAL_MODELS}
              selected={selectedModel}
              onSelect={setSelectedModel}
              installedModels={installedModels}
            />
            <ModelGroup
              title="☁ Cloud"
              subtitle="Requires API key"
              models={CLOUD_MODELS}
              selected={selectedModel}
              onSelect={setSelectedModel}
              className="mt-3"
            />
          </div>

          {/* Ignite button */}
          <button
            onClick={handleCreate}
            className="neon-btn neon-btn-amber w-full py-4 text-base tracking-wider font-bold"
            style={{
              opacity: description.trim() && !isCreating ? 1 : 0.4,
              cursor: description.trim() && !isCreating ? "pointer" : "not-allowed",
            }}
          >
            {isCreating ? "IGNITING..." : "⚡ IGNITE PROJECT"}
          </button>
          <p className="font-mono text-[10px] text-[var(--text-dim)] text-center mt-3">
            ↵ Enter to create · Projects saved locally
          </p>
        </div>
      </section>

      {/* ── CITY VIEW ──────────────────────────────── */}
      {isMounted && (
        <section className="flex-1 px-6 pb-12">
          {projects.length > 0 && (
            <>
              <div className="flex items-center gap-4 max-w-5xl mx-auto mb-8">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[rgba(155,93,229,0.3)] to-transparent" />
                <span className="font-mono text-xs text-[var(--text-dim)] uppercase tracking-widest">Your City</span>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[rgba(155,93,229,0.3)] to-transparent" />
              </div>

              <div className="max-w-5xl mx-auto relative">
                <div className="flex items-end gap-8 justify-center flex-wrap pb-6">
                  {projects.map((project, i) => (
                    <div key={project.id} className="animate-building-rise" style={{ animationDelay: `${i * 0.08}s` }}>
                      <BuildingCard project={project} />
                    </div>
                  ))}
                  <div className="animate-building-rise" style={{ animationDelay: `${projects.length * 0.08}s` }}>
                    <NewProjectCard onClick={handleNewProjectClick} />
                  </div>
                </div>
                <div className="h-px w-full" style={{ background: "linear-gradient(to right, transparent, rgba(155,93,229,0.4), rgba(245,166,35,0.3), rgba(57,255,20,0.2), transparent)" }} />
                <div className="h-4 w-full opacity-30 blur-sm -mt-1" style={{ background: "linear-gradient(to right, transparent, rgba(155,93,229,0.15), rgba(245,166,35,0.1), transparent)" }} />

                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {projects.map((project) => (
                    <ProjectListItem key={project.id} project={project} />
                  ))}
                </div>
              </div>
            </>
          )}

          {!projects.length && (
            <div className="flex flex-col items-center justify-center py-10 gap-3 opacity-30">
              <div className="font-mono text-4xl">🏗</div>
              <p className="font-mono text-sm text-[var(--text-dim)]">Your city is empty. Create your first project above.</p>
            </div>
          )}
        </section>
      )}
    </main>
  );
}

// ── Model picker group ──────────────────────────────────────

function ModelGroup({
  title,
  subtitle,
  models,
  selected,
  onSelect,
  installedModels,
  className = "",
}: {
  title: string;
  subtitle: string;
  models: ModelConfig[];
  selected: string;
  onSelect: (id: string) => void;
  installedModels?: string[] | null;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="font-mono text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-widest">{title}</span>
        <span className="font-mono text-[10px] text-[var(--text-dim)]">{subtitle}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {models.map((m) => {
          const isSelected = selected === m.id;
          // For local models, check if installed (null = still loading)
          const isLocal     = m.provider === "ollama";
          const isInstalled = !isLocal || installedModels === null || installedModels.includes(m.id);
          const needsPull   = isLocal && installedModels !== null && !installedModels.includes(m.id);

          return (
            <button
              key={m.id}
              onClick={() => onSelect(m.id)}
              title={needsPull ? `Not installed — run: ollama pull ${m.id}` : m.description}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-mono text-xs font-semibold transition-all duration-200 border relative"
              style={{
                background:   isSelected ? `${m.color}18` : "var(--bg-input)",
                borderColor:  isSelected ? `${m.color}60` : needsPull ? "rgba(255,255,255,0.04)" : "var(--border-subtle)",
                color:        isSelected ? m.color : needsPull ? "var(--text-dim)" : "var(--text-secondary)",
                boxShadow:    isSelected ? `0 0 14px ${m.color}20` : "none",
                transform:    isSelected ? "translateY(-1px)" : "none",
                opacity:      needsPull ? 0.5 : 1,
              }}
            >
              <span>{m.icon}</span>
              <span>{m.label}</span>
              {needsPull && (
                <span className="font-mono text-[9px] opacity-70 ml-0.5">↓</span>
              )}
            </button>
          );
        })}
      </div>
      {/* Show pull hint if any local models are missing */}
      {installedModels !== null && models.some((m) => m.provider === "ollama" && !installedModels.includes(m.id)) && (
        <p className="font-mono text-[10px] text-[var(--text-dim)] mt-2">
          ↓ = not installed · run <span className="text-[#ff2d78]">ollama pull &lt;model&gt;</span> to add it
        </p>
      )}
    </div>
  );
}

// ── Project list item ───────────────────────────────────────

function ProjectListItem({ project }: { project: Project }) {
  const router = useRouter();
  const color  = getAIColor(project.ai);
  const config = getModelConfig(project.ai);
  const createdAt = new Date(project.createdAt);

  return (
    <button
      onClick={() => router.push(`/project/${project.id}`)}
      className="glow-card text-left p-4 w-full transition-all duration-200 hover:-translate-y-0.5"
      style={{ borderColor: `${color}25` }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="font-display font-semibold text-sm text-[var(--text-primary)] truncate">{project.name}</span>
        <AIBadge modelId={project.ai} size="sm" showLabel={false} />
      </div>
      <p className="font-mono text-xs text-[var(--text-dim)] line-clamp-2 leading-relaxed">{project.description}</p>
      <div className="flex items-center justify-between mt-3">
        <span className="font-mono text-[10px] text-[var(--text-dim)]">
          {createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </span>
        <span className="font-mono text-[10px]" style={{ color }}>
          {config.label} →
        </span>
      </div>
    </button>
  );
}
