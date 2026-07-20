// E·S·G 충족률 게이지 바 — 순수 SVG/CSS

import { CATEGORY_LABELS } from "@/lib/constants";

const CATEGORY_COLORS: Record<string, string> = {
  E: "#177452",
  S: "#C9972B",
  G: "#0C3B2A",
};

export function GaugeBar({ category, value }: { category: "E" | "S" | "G"; value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-sm font-semibold">
          {category} · {CATEGORY_LABELS[category]}
        </span>
        <span className="text-sm font-bold" style={{ color: CATEGORY_COLORS[category] }}>
          {clamped.toFixed(1)}점
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-line">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${clamped}%`, backgroundColor: CATEGORY_COLORS[category] }}
        />
      </div>
    </div>
  );
}
