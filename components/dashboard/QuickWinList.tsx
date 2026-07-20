"use client";

// Quick Win TOP 5 — 우선순위 점수(impact×10 - effort×3 + 상태 보너스) 상위 지표

import Link from "next/link";
import { priorityScore } from "@/lib/scoring";
import { VerdictBadge } from "@/components/ui/Badge";
import type { IndicatorResult } from "@/lib/types";

export function QuickWinList({ indicators }: { indicators: IndicatorResult[] }) {
  const top5 = indicators
    .filter((i) => i.status !== "충족") // 이미 충족한 지표는 개선 대상 아님
    .sort((a, b) => priorityScore(b) - priorityScore(a))
    .slice(0, 5);

  if (top5.length === 0) {
    return <p className="text-sm text-subtext">개선이 필요한 지표가 없습니다. 🎉</p>;
  }

  return (
    <ol className="divide-y divide-line">
      {top5.map((ind, rank) => (
        <li key={ind.id}>
          <Link
            href="/app/indicators"
            className="flex items-center gap-3 py-3 hover:bg-bg"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pine-bg text-xs font-bold text-pine">
              {rank + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {ind.id} · {ind.title}
              </p>
              <p className="text-xs text-subtext">
                효과 {ind.impact} · 난이도 {ind.effort}
              </p>
            </div>
            <VerdictBadge status={ind.status} />
          </Link>
        </li>
      ))}
    </ol>
  );
}
