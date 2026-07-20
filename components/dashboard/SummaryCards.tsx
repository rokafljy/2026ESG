// 충족/부분충족/미충족/확인불가 카운트 카드

import { verdictCounts } from "@/lib/scoring";
import type { IndicatorResult } from "@/lib/types";

const COUNT_STYLES: { key: keyof ReturnType<typeof verdictCounts>; color: string }[] = [
  { key: "충족", color: "text-pine" },
  { key: "부분충족", color: "text-amber" },
  { key: "미충족", color: "text-danger" },
  { key: "확인불가", color: "text-subtext" },
];

export function SummaryCards({ indicators }: { indicators: IndicatorResult[] }) {
  const counts = verdictCounts(indicators);
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {COUNT_STYLES.map(({ key, color }) => (
        <div key={key} className="card p-4 text-center">
          <p className={`text-2xl font-extrabold ${color}`}>{counts[key]}</p>
          <p className="mt-0.5 text-xs text-subtext">{key}</p>
        </div>
      ))}
    </div>
  );
}
