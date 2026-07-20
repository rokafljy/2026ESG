"use client";

// 필터 칩 — 전체/미충족/부분충족/충족/E/S/G

export const FILTERS = ["전체", "미충족", "부분충족", "충족", "E", "S", "G"] as const;
export type Filter = (typeof FILTERS)[number];

export function FilterChips({
  active,
  counts,
  onChange,
}: {
  active: Filter;
  counts: Record<Filter, number>;
  onChange: (f: Filter) => void;
}) {
  return (
    <div className="print-hidden flex flex-wrap gap-2">
      {FILTERS.map((f) => (
        <button
          key={f}
          onClick={() => onChange(f)}
          className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
            active === f
              ? "border-pine bg-pine text-white"
              : "border-line bg-surface text-subtext hover:border-pine/50"
          }`}
        >
          {f} <span className="opacity-70">{counts[f]}</span>
        </button>
      ))}
    </div>
  );
}
