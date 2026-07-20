"use client";

// 개선과제 항목 — 체크박스 완료 처리 시 Firestore 에 저장 (구독 유지 핵심 기능)

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { toggleAction } from "@/lib/update-action";
import type { ActionItem, IndicatorResult } from "@/lib/types";

export interface RoadmapTask {
  indicator: IndicatorResult;
  actionIndex: number;
  action: ActionItem;
}

export function TaskItem({ task, assessmentId }: { task: RoadmapTask; assessmentId: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const { indicator, actionIndex, action } = task;

  async function handleToggle() {
    setBusy(true);
    setError("");
    try {
      await toggleAction(assessmentId, indicator.id, indicator.actions, actionIndex);
    } catch {
      setError("저장에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-card border border-line bg-surface p-3">
      <label className="flex cursor-pointer items-start gap-2.5">
        <input
          type="checkbox"
          checked={action.done}
          disabled={busy}
          onChange={handleToggle}
          className="mt-0.5 h-4 w-4 accent-pine"
        />
        <div className="min-w-0 flex-1">
          <p className={`text-sm ${action.done ? "text-subtext line-through" : "font-medium"}`}>
            {action.text}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <Badge className="bg-pine-bg text-pine">{indicator.id}</Badge>
            <span className="truncate text-xs text-subtext">{indicator.title}</span>
          </div>
        </div>
      </label>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
