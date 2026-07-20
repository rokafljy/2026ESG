"use client";

// 지표 아코디언 행 — 판정 배지, 만점기준, 근거, 갭, 개선과제 체크리스트

import { useState } from "react";
import { VerdictBadge, Badge } from "@/components/ui/Badge";
import { CATEGORY_LABELS } from "@/lib/constants";
import { toggleAction } from "@/lib/update-action";
import type { IndicatorResult } from "@/lib/types";

export function IndicatorAccordion({
  assessmentId,
  indicator,
}: {
  assessmentId: string;
  indicator: IndicatorResult;
}) {
  const [open, setOpen] = useState(false);
  const [saveError, setSaveError] = useState("");

  async function handleToggle(index: number) {
    setSaveError("");
    try {
      await toggleAction(assessmentId, indicator.id, indicator.actions, index);
    } catch {
      setSaveError("저장에 실패했습니다. 네트워크를 확인해 주세요.");
    }
  }

  return (
    <div className="card overflow-hidden">
      {/* 헤더 (클릭으로 펼침) */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-bg"
        aria-expanded={open}
      >
        <Badge className="bg-pine-bg text-pine">{indicator.id}</Badge>
        <span className="min-w-0 flex-1 truncate text-sm font-semibold">{indicator.title}</span>
        <span className="hidden text-xs text-subtext sm:inline">
          {CATEGORY_LABELS[indicator.category]}
        </span>
        <VerdictBadge status={indicator.status} />
        <span
          className={`print-hidden text-subtext transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        >
          ▾
        </span>
      </button>

      {/* 본문 — 인쇄 시에는 항상 펼침(print-expanded) */}
      <div className={`${open ? "block" : "hidden"} print-expanded border-t border-line px-4 py-4`}>
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="font-semibold text-subtext">만점기준</dt>
            <dd className="mt-0.5">{indicator.criteria}</dd>
          </div>
          <div>
            <dt className="font-semibold text-subtext">보고서 내 근거</dt>
            <dd className="mt-0.5">
              {indicator.evidence || <span className="text-subtext">근거를 찾지 못했습니다.</span>}
            </dd>
          </div>
          {indicator.gap && (
            <div>
              <dt className="font-semibold text-subtext">갭 (만점기준 대비 부족한 점)</dt>
              <dd className="mt-0.5">{indicator.gap}</dd>
            </div>
          )}
          <div className="flex gap-4 text-xs text-subtext">
            <span>등급효과: {indicator.impact}</span>
            <span>난이도: {indicator.effort}</span>
          </div>

          {indicator.actions.length > 0 && (
            <div>
              <dt className="font-semibold text-subtext">개선과제</dt>
              <dd className="mt-1.5 space-y-1.5">
                {indicator.actions.map((action, i) => (
                  <label key={i} className="flex cursor-pointer items-start gap-2">
                    <input
                      type="checkbox"
                      checked={action.done}
                      onChange={() => handleToggle(i)}
                      className="mt-0.5 h-4 w-4 accent-pine"
                    />
                    <span className={action.done ? "text-subtext line-through" : ""}>
                      {action.text}
                    </span>
                  </label>
                ))}
                {saveError && <p className="text-xs text-danger">{saveError}</p>}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
