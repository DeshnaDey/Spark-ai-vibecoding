"use client";

import { getAIColor, getModelConfig } from "@/lib/storage";

const FLOOR_META: Record<string, { label: string; short: string; icon: string }> = {
  Context: { label: "CONTEXT",  short: "CTX", icon: "◉" },
  Chat:    { label: "CHAT",     short: "CHT", icon: "◈" },
  Files:   { label: "FILES",    short: "FLS", icon: "▦" },
  History: { label: "HISTORY",  short: "HST", icon: "◷" },
};

interface FloorNavProps {
  floors: string[];
  activeFloor: string;
  onFloorChange: (floor: string) => void;
  projectName: string;
  modelId: string;
}

export default function FloorNav({
  floors,
  activeFloor,
  onFloorChange,
  projectName,
  modelId,
}: FloorNavProps) {
  const color  = getAIColor(modelId);
  const config = getModelConfig(modelId);

  // Floors render bottom → top (highest floor number at top)
  const ordered = [...floors].reverse();

  return (
    <div className="flex flex-col items-center w-full select-none px-3 py-2">

      {/* ── Antenna / spire ── */}
      <div className="flex flex-col items-center mb-0">
        <div className="w-px h-5 bg-gradient-to-b from-transparent" style={{ background: `linear-gradient(to bottom, transparent, ${color})` }} />
        <div
          className="w-2 h-2 rounded-full"
          style={{ background: color, boxShadow: `0 0 8px ${color}, 0 0 16px ${color}80` }}
        />
        <div className="w-px h-3" style={{ background: color, opacity: 0.6 }} />
      </div>

      {/* ── Building body ── */}
      <div
        className="w-full rounded-t-lg overflow-hidden"
        style={{
          border: `1px solid ${color}40`,
          borderBottom: "none",
          boxShadow: `0 0 20px ${color}15, inset 0 0 20px rgba(0,0,0,0.3)`,
          background: "var(--bg-deep)",
        }}
      >
        {/* Neon sign on top of building */}
        <div
          className="w-full px-2 py-2 text-center border-b"
          style={{
            borderColor: `${color}30`,
            background: `${color}08`,
          }}
        >
          <div
            className="font-display font-bold text-[10px] leading-tight truncate"
            style={{
              color,
              textShadow: `0 0 8px ${color}80, 0 0 16px ${color}40`,
              letterSpacing: "0.05em",
            }}
          >
            {projectName.toUpperCase()}
          </div>
          <div
            className="font-mono text-[8px] mt-0.5 flex items-center justify-center gap-1"
            style={{ color: `${color}80` }}
          >
            <span>{config.icon}</span>
            <span className="truncate">{config.label}</span>
          </div>
        </div>

        {/* Floors — rendered top to bottom visually = high to low floor number */}
        {ordered.map((floor, idx) => {
          const isActive  = floor === activeFloor;
          const floorNum  = floors.length - idx;
          const meta      = FLOOR_META[floor] ?? { label: floor.toUpperCase(), short: floor.slice(0,3).toUpperCase(), icon: "◦" };
          const isTopFloor   = idx === 0;
          const isBotFloor   = idx === ordered.length - 1;

          return (
            <button
              key={floor}
              onClick={() => onFloorChange(floor)}
              className="w-full flex flex-col items-center gap-1 py-3 px-2 transition-all duration-200 relative group"
              style={{
                background: isActive ? `${color}12` : "transparent",
                borderTop: isTopFloor ? "none" : `1px solid ${isActive ? color + "30" : "rgba(255,255,255,0.04)"}`,
              }}
            >
              {/* Floor number badge */}
              <div
                className="flex items-center justify-center w-6 h-6 rounded-full font-mono text-xs font-bold transition-all duration-200"
                style={{
                  background: isActive ? `${color}25` : "rgba(255,255,255,0.04)",
                  border: `1px solid ${isActive ? color : "rgba(255,255,255,0.08)"}`,
                  color: isActive ? color : "var(--text-dim)",
                  boxShadow: isActive ? `0 0 10px ${color}50` : "none",
                }}
              >
                {floorNum}
              </div>

              {/* Floor icon + label */}
              <div className="flex flex-col items-center gap-0.5">
                <span
                  className="text-base transition-all duration-200"
                  style={{
                    color: isActive ? color : "var(--text-dim)",
                    filter: isActive ? `drop-shadow(0 0 4px ${color})` : "none",
                  }}
                >
                  {meta.icon}
                </span>
                <span
                  className="font-mono text-[8px] tracking-widest font-semibold transition-colors duration-200"
                  style={{ color: isActive ? color : "var(--text-dim)" }}
                >
                  {meta.short}
                </span>
              </div>

              {/* Windows row */}
              <div className="flex gap-1 mt-0.5">
                {[0, 1, 2].map((w) => (
                  <div
                    key={w}
                    className="w-2 h-1.5 rounded-sm transition-all duration-300"
                    style={{
                      background: isActive
                        ? w === 1
                          ? color
                          : `${color}60`
                        : "rgba(255,255,255,0.06)",
                      boxShadow: isActive ? `0 0 4px ${color}80` : "none",
                    }}
                  />
                ))}
              </div>

              {/* Active floor indicator bar on left edge */}
              {isActive && (
                <div
                  className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full"
                  style={{
                    background: color,
                    boxShadow: `0 0 6px ${color}`,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Ground / foundation ── */}
      <div
        className="w-full h-2 rounded-b-sm"
        style={{
          background: `linear-gradient(to bottom, ${color}20, transparent)`,
          borderLeft: `1px solid ${color}30`,
          borderRight: `1px solid ${color}30`,
          borderBottom: `1px solid ${color}20`,
        }}
      />
      {/* Ground glow */}
      <div
        className="w-4/5 h-px mt-px"
        style={{
          background: color,
          opacity: 0.3,
          filter: "blur(4px)",
          boxShadow: `0 0 12px ${color}`,
        }}
      />
      <div className="w-3/5 h-px mt-px opacity-10" style={{ background: color, filter: "blur(8px)" }} />
    </div>
  );
}
