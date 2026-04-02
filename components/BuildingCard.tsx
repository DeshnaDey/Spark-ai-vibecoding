"use client";

import { useRouter } from "next/navigation";
import { Project, getAIColor } from "@/lib/storage";
import AIBadge from "./AIBadge";

interface BuildingCardProps {
  project: Project;
}

// Deterministic building shape based on project ID
function getBuildingShape(id: string): number {
  let hash = 0;
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffffffff;
  return Math.abs(hash) % 4;
}

function BuildingSVG({
  color,
  shape,
  glowing,
}: {
  color: string;
  shape: number;
  glowing: boolean;
}) {
  const dimColor = `${color}60`;
  const windowColor = glowing ? color : `${color}80`;
  const filter = glowing
    ? `drop-shadow(0 0 6px ${color}) drop-shadow(0 0 12px ${color}60)`
    : `drop-shadow(0 0 2px ${color}40)`;

  const buildings = [
    // Shape 0: Tall skyscraper with antenna
    <svg key={0} viewBox="0 0 80 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="20" width="40" height="90" fill={dimColor} stroke={color} strokeWidth="1.5"/>
      <line x1="40" y1="20" x2="40" y2="5" stroke={color} strokeWidth="1.5"/>
      <circle cx="40" cy="4" r="2" fill={color}/>
      {/* Windows grid */}
      {[30,40,50,60,70,80,90].map((y) =>
        [26,35,44].map((x) => (
          <rect key={`${x}-${y}`} x={x} y={y} width="6" height="5" fill={windowColor} rx="1"/>
        ))
      )}
    </svg>,

    // Shape 1: Stepped pyramid tower
    <svg key={1} viewBox="0 0 80 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="80" width="60" height="30" fill={dimColor} stroke={color} strokeWidth="1.5"/>
      <rect x="20" y="50" width="40" height="30" fill={dimColor} stroke={color} strokeWidth="1.5"/>
      <rect x="28" y="25" width="24" height="25" fill={dimColor} stroke={color} strokeWidth="1.5"/>
      <rect x="34" y="12" width="12" height="13" fill={dimColor} stroke={color} strokeWidth="1.5"/>
      {[85,90].map((y) => [15,25,35,45,55].map((x) =>
        <rect key={`${x}-${y}`} x={x} y={y} width="5" height="4" fill={windowColor} rx="1"/>
      ))}
      {[55,63].map((y) => [24,34,44].map((x) =>
        <rect key={`${x}-${y}`} x={x} y={y} width="5" height="4" fill={windowColor} rx="1"/>
      ))}
    </svg>,

    // Shape 2: Wide office block with spire
    <svg key={2} viewBox="0 0 80 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="50" width="70" height="60" fill={dimColor} stroke={color} strokeWidth="1.5"/>
      <rect x="25" y="25" width="30" height="25" fill={dimColor} stroke={color} strokeWidth="1.5"/>
      <polygon points="40,5 50,25 30,25" fill={dimColor} stroke={color} strokeWidth="1.5"/>
      {[55,65,75,85,95,105].map((y) =>
        [10,22,34,46,58].map((x) =>
          <rect key={`${x}-${y}`} x={x} y={y} width="8" height="5" fill={windowColor} rx="1"/>
        )
      )}
    </svg>,

    // Shape 3: Twin towers
    <svg key={3} viewBox="0 0 80 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="35" width="28" height="75" fill={dimColor} stroke={color} strokeWidth="1.5"/>
      <rect x="47" y="45" width="28" height="65" fill={dimColor} stroke={color} strokeWidth="1.5"/>
      <line x1="19" y1="35" x2="19" y2="20" stroke={color} strokeWidth="1.5"/>
      <circle cx="19" cy="19" r="2.5" fill={color}/>
      <line x1="61" y1="45" x2="61" y2="30" stroke={color} strokeWidth="1.5"/>
      <circle cx="61" cy="29" r="2.5" fill={color}/>
      {[42,54,66,78,90,100].map((y) =>
        [9,18].map((x) =>
          <rect key={`L${x}-${y}`} x={x} y={y} width="5" height="4" fill={windowColor} rx="1"/>
        )
      )}
      {[52,62,74,86,98].map((y) =>
        [51,60].map((x) =>
          <rect key={`R${x}-${y}`} x={x} y={y} width="5" height="4" fill={windowColor} rx="1"/>
        )
      )}
    </svg>,
  ];

  return (
    <div style={{ filter }} className="w-full h-full transition-all duration-300">
      {buildings[shape]}
    </div>
  );
}

export default function BuildingCard({ project }: BuildingCardProps) {
  const router = useRouter();
  const color = getAIColor(project.ai);
  const shape = getBuildingShape(project.id);

  return (
    <div
      onClick={() => router.push(`/project/${project.id}`)}
      className="relative cursor-pointer group flex flex-col items-center select-none"
      style={{ animationDelay: "0.1s" }}
    >
      {/* Building SVG */}
      <div
        className="w-[100px] h-[120px] transition-transform duration-300 group-hover:-translate-y-2"
        style={{
          filter: `drop-shadow(0 4px 12px ${color}20)`,
        }}
      >
        <BuildingSVG
          color={color}
          shape={shape}
          glowing={false}
        />
      </div>

      {/* Glow on hover */}
      <div
        className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 80%, ${color}15 0%, transparent 70%)`,
        }}
      />

      {/* Ground glow */}
      <div
        className="w-20 h-2 rounded-full opacity-40 group-hover:opacity-80 transition-opacity duration-300 blur-sm mt-1"
        style={{ background: color }}
      />

      {/* Name sign */}
      <div
        className="mt-3 px-3 py-1.5 rounded-lg text-center max-w-[120px]"
        style={{
          background: `${color}12`,
          border: `1px solid ${color}40`,
          boxShadow: `0 0 10px ${color}20`,
        }}
      >
        <div
          className="font-mono text-xs font-semibold truncate"
          style={{ color }}
        >
          {project.name}
        </div>
        <div className="mt-1">
          <AIBadge ai={project.ai} size="sm" showLabel={false} />
        </div>
      </div>
    </div>
  );
}

// New project "construction site" card
export function NewProjectCard({ onClick }: { onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="relative cursor-pointer group flex flex-col items-center select-none"
    >
      {/* Construction crane SVG */}
      <div className="w-[100px] h-[120px] flex items-end justify-center transition-transform duration-300 group-hover:-translate-y-2">
        <svg viewBox="0 0 80 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Foundation outline */}
          <rect x="15" y="80" width="50" height="30" fill="rgba(155,93,229,0.08)" stroke="rgba(155,93,229,0.4)" strokeWidth="1.5" strokeDasharray="4 3"/>
          {/* Crane base */}
          <rect x="35" y="30" width="10" height="50" fill="rgba(155,93,229,0.15)" stroke="rgba(155,93,229,0.5)" strokeWidth="1.5"/>
          {/* Crane arm */}
          <line x1="20" y1="32" x2="60" y2="32" stroke="rgba(155,93,229,0.5)" strokeWidth="2"/>
          <line x1="45" y1="32" x2="45" y2="50" stroke="rgba(155,93,229,0.4)" strokeWidth="1" strokeDasharray="3 2"/>
          {/* "+" symbol */}
          <text x="40" y="72" textAnchor="middle" fill="rgba(155,93,229,0.8)" fontSize="18" fontWeight="bold">+</text>
        </svg>
      </div>

      {/* Ground */}
      <div className="w-20 h-2 rounded-full opacity-30 group-hover:opacity-60 transition-opacity duration-300 blur-sm mt-1 bg-[#9b5de5]"/>

      {/* Label */}
      <div className="mt-3 px-3 py-1.5 rounded-lg text-center max-w-[120px] border border-dashed border-[rgba(155,93,229,0.4)] bg-[rgba(155,93,229,0.06)] group-hover:border-[rgba(155,93,229,0.7)] transition-colors duration-300">
        <div className="font-mono text-xs font-semibold text-[#9b5de5]">
          NEW PROJECT
        </div>
      </div>
    </div>
  );
}
