"use client";

// 분석 진행 5단계 표시 — 보고서 인식 → E → S → G → 우선순위 산출

import { STAGES } from "@/lib/constants";
import { Spinner } from "@/components/ui/Spinner";

export function ProgressSteps({
  currentIndex,
  errorIndex,
}: {
  /** 현재 진행 중인 단계 인덱스 (완료된 단계는 그 미만). 전체 완료 시 STAGES.length */
  currentIndex: number;
  /** 오류가 발생한 단계 인덱스 (없으면 null) */
  errorIndex: number | null;
}) {
  return (
    <ol className="space-y-3">
      {STAGES.map((stage, i) => {
        const isDone = errorIndex === null ? i < currentIndex : i < errorIndex;
        const isCurrent = errorIndex === null && i === currentIndex;
        const isError = errorIndex === i;

        return (
          <li key={stage.key} className="flex items-center gap-3">
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                isDone
                  ? "bg-pine text-white"
                  : isError
                    ? "bg-danger text-white"
                    : isCurrent
                      ? "bg-pine-bg text-pine"
                      : "bg-line text-subtext"
              }`}
            >
              {isDone ? "✓" : isError ? "!" : i + 1}
            </span>
            <span
              className={`text-sm ${
                isCurrent || isDone ? "font-semibold text-ink" : "text-subtext"
              }`}
            >
              {stage.label}
            </span>
            {isCurrent && <Spinner className="h-4 w-4" />}
          </li>
        );
      })}
    </ol>
  );
}
