"use client";

const FLOOR_LABELS: Record<string, string> = {
  Context: "CTX",
  Chat:    "CHT",
  Files:   "FLS",
  History: "HST",
};

const FLOOR_ICONS: Record<string, string> = {
  Context: "◉",
  Chat:    "◈",
  Files:   "▦",
  History: "◷",
};

interface FloorNavProps {
  floors: string[];
  activeFloor: string;
  onFloorChange: (floor: string) => void;
}

export default function FloorNav({ floors, activeFloor, onFloorChange }: FloorNavProps) {
  return (
    <nav className="flex flex-col items-center gap-4 py-4">
      {/* Elevator shaft decoration */}
      <div
        className="w-px flex-1 absolute top-20 bottom-4 left-1/2 -translate-x-1/2 opacity-20"
        style={{ background: "linear-gradient(to bottom, transparent, #9b5de5, transparent)" }}
      />

      {floors.map((floor, i) => {
        const isActive = floor === activeFloor;
        const floorNum = floors.length - i; // count from top

        return (
          <div key={floor} className="flex flex-col items-center gap-1 relative z-10">
            <button
              onClick={() => onFloorChange(floor)}
              className={`floor-btn ${isActive ? "active" : ""}`}
              title={floor}
            >
              {isActive ? (
                <span className="text-[11px]">{FLOOR_ICONS[floor] ?? floorNum}</span>
              ) : (
                <span className="text-[11px] font-mono">{floorNum}</span>
              )}
            </button>
            <span
              className="font-mono text-[9px] tracking-widest uppercase transition-colors duration-200"
              style={{ color: isActive ? "#f5a623" : "#555570" }}
            >
              {FLOOR_LABELS[floor] ?? floor.slice(0, 3).toUpperCase()}
            </span>
          </div>
        );
      })}

      {/* Shaft base */}
      <div className="w-8 h-1 rounded-full bg-[rgba(155,93,229,0.3)] mt-2" />
    </nav>
  );
}
