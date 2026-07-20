"use client";

// 로드맵 단계 컬럼 — 과제 목록 + 이행률 바

import { PHASE_LABELS, type RoadmapPhase } from "@/lib/scoring";
import { TaskItem, type RoadmapTask } from "./TaskItem";

export function PhaseColumn({
  phase,
  tasks,
  assessmentId,
}: {
  phase: RoadmapPhase;
  tasks: RoadmapTask[];
  assessmentId: string;
}) {
  const doneCount = tasks.filter((t) => t.action.done).length;
  const rate = tasks.length === 0 ? 0 : Math.round((doneCount / tasks.length) * 100);
  const { title, description } = PHASE_LABELS[phase];

  return (
    <section className="card flex flex-col p-5">
      <h2 className="text-base font-bold">{title}</h2>
      <p className="mt-0.5 text-xs text-subtext">{description}</p>

      {/* 이행률 */}
      <div className="mt-3">
        <div className="flex items-baseline justify-between text-xs">
          <span className="text-subtext">
            이행률 {doneCount}/{tasks.length}
          </span>
          <span className="font-bold text-pine">{rate}%</span>
        </div>
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-pine transition-all"
            style={{ width: `${rate}%` }}
          />
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {tasks.length === 0 ? (
          <p className="py-4 text-center text-xs text-subtext">이 단계의 과제가 없습니다.</p>
        ) : (
          tasks.map((t) => (
            <TaskItem
              key={`${t.indicator.id}-${t.actionIndex}`}
              task={t}
              assessmentId={assessmentId}
            />
          ))
        )}
      </div>
    </section>
  );
}
