"use client";

// 개선 로드맵 — 개선과제를 3단계로 자동 분류, 체크박스 완료를 Firestore 에 저장
// 1단계 Quick Win(난이도 하) / 2단계 체계구축(난이도 중) / 3단계 인증·시스템(난이도 상)

import { useMemo } from "react";
import { useLatestAssessment } from "@/lib/use-latest-assessment";
import { phaseOf, priorityScore, type RoadmapPhase } from "@/lib/scoring";
import { PhaseColumn } from "@/components/roadmap/PhaseColumn";
import type { RoadmapTask } from "@/components/roadmap/TaskItem";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { LinkButton } from "@/components/ui/Button";
import { FullPageLoading } from "@/components/ui/Spinner";

export default function RoadmapPage() {
  const { assessment, indicators, loading, error } = useLatestAssessment();

  // 미충족·부분충족·확인불가 지표의 개선과제를 단계별로 분류
  const phases = useMemo(() => {
    const result: Record<RoadmapPhase, RoadmapTask[]> = { 1: [], 2: [], 3: [] };
    const targets = indicators
      .filter((i) => i.status !== "충족")
      .sort((a, b) => priorityScore(b) - priorityScore(a)); // 효과 큰 순으로 정렬

    for (const indicator of targets) {
      const phase = phaseOf(indicator);
      indicator.actions.forEach((action, actionIndex) => {
        result[phase].push({ indicator, actionIndex, action });
      });
    }
    return result;
  }, [indicators]);

  if (loading) return <FullPageLoading message="개선 로드맵을 불러오는 중..." />;

  if (error) return <p className="text-sm text-danger">{error}</p>;

  if (!assessment || assessment.status !== "done") {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <h1 className="text-xl font-bold">
          {assessment?.status === "processing"
            ? "분석이 진행 중입니다"
            : "완료된 진단이 없습니다"}
        </h1>
        <p className="text-sm text-subtext">진단이 완료되면 개선 로드맵이 생성됩니다.</p>
        <LinkButton href="/app/new">새 진단 시작하기</LinkButton>
      </div>
    );
  }

  const allTasks = [...phases[1], ...phases[2], ...phases[3]];
  const doneCount = allTasks.filter((t) => t.action.done).length;
  const overallRate =
    allTasks.length === 0 ? 0 : Math.round((doneCount / allTasks.length) * 100);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">개선 로드맵</h1>
          <p className="mt-1 text-sm text-subtext">
            {assessment.companyName} · 전체 이행률{" "}
            <span className="font-bold text-pine">{overallRate}%</span> ({doneCount}/
            {allTasks.length})
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <PhaseColumn phase={1} tasks={phases[1]} assessmentId={assessment.id} />
        <PhaseColumn phase={2} tasks={phases[2]} assessmentId={assessment.id} />
        <PhaseColumn phase={3} tasks={phases[3]} assessmentId={assessment.id} />
      </div>

      <Disclaimer />
    </div>
  );
}
