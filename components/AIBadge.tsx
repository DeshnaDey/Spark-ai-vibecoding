"use client";

import { AIModel, getAIColor } from "@/lib/storage";

interface AIBadgeProps {
  ai: AIModel;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const AI_ICONS: Record<AIModel, string> = {
  GPT: "⚡",
  Claude: "◈",
  Gemini: "✦",
};

export default function AIBadge({ ai, size = "md", showLabel = true }: AIBadgeProps) {
  const color = getAIColor(ai);

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-sm px-3 py-1 gap-1.5",
    lg: "text-base px-4 py-1.5 gap-2",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-mono font-semibold ${sizeClasses[size]}`}
      style={{
        color,
        background: `${color}14`,
        border: `1px solid ${color}50`,
        boxShadow: `0 0 8px ${color}30, inset 0 0 4px ${color}10`,
      }}
    >
      <span>{AI_ICONS[ai]}</span>
      {showLabel && <span>{ai}</span>}
    </span>
  );
}
