"use client";

import { getModelConfig } from "@/lib/storage";

interface AIBadgeProps {
  modelId: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export default function AIBadge({ modelId, size = "md", showLabel = true }: AIBadgeProps) {
  const config = getModelConfig(modelId);
  const { color, icon, label } = config;

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
      <span>{icon}</span>
      {showLabel && <span className="truncate max-w-[80px]">{label}</span>}
    </span>
  );
}
