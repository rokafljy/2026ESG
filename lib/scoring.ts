// 점수·등급·우선순위 계산 (명세서 6번) — 순수 함수만 포함, 클라이언트/서버 공용

import type { IndicatorResult, Level, Verdict } from "./types";

/** 상/중/하 → 숫자 변환 */
const LEVEL_NUM: Record<Level, number> = { 상: 3, 중: 2, 하: 1 };

/** 판정 → 점수: 충족=100, 부분충족=50, 미충족·확인불가=0 */
export function verdictScore(status: Verdict): number {
  if (status === "충족") return 100;
  if (status === "부분충족") return 50;
  return 0;
}

/**
 * 우선순위 점수 = impact×10 - effort×3 + (미충족 +5, 부분충족 +3)
 * Quick Win 정렬에 사용 — 클수록 우선
 */
export function priorityScore(ind: Pick<IndicatorResult, "impact" | "effort" | "status">): number {
  const statusBonus = ind.status === "미충족" ? 5 : ind.status === "부분충족" ? 3 : 0;
  return LEVEL_NUM[ind.impact] * 10 - LEVEL_NUM[ind.effort] * 3 + statusBonus;
}

/** 카테고리 점수 = 소속 지표 판정 점수의 평균 (소수 첫째 자리 반올림) */
export function categoryScore(indicators: Pick<IndicatorResult, "status">[]): number {
  if (indicators.length === 0) return 0;
  const sum = indicators.reduce((acc, i) => acc + verdictScore(i.status), 0);
  return Math.round((sum / indicators.length) * 10) / 10;
}

/** 평균 점수 → 모의등급: 85↑ A+, 70↑ A, 55↑ B+, 40↑ B, 25↑ C, 미만 D */
export function gradeFromAvg(avg: number): string {
  if (avg >= 85) return "A+";
  if (avg >= 70) return "A";
  if (avg >= 55) return "B+";
  if (avg >= 40) return "B";
  if (avg >= 25) return "C";
  return "D";
}

/** 로드맵 3단계 분류 (명세서 3번-5) */
export type RoadmapPhase = 1 | 2 | 3;

export function phaseOf(ind: Pick<IndicatorResult, "impact" | "effort">): RoadmapPhase {
  // 3단계: 인증·시스템 (난이도 상)
  if (ind.effort === "상") return 3;
  // 2단계: 체계구축 (난이도 중)
  if (ind.effort === "중") return 2;
  // 1단계: Quick Win (난이도 하 — 효과가 클수록 위로 정렬됨)
  return 1;
}

export const PHASE_LABELS: Record<RoadmapPhase, { title: string; description: string }> = {
  1: { title: "1단계 · Quick Win", description: "효과가 크고 난이도가 낮아 즉시 착수할 과제" },
  2: { title: "2단계 · 체계구축", description: "데이터·프로세스 체계를 갖추는 중난이도 과제" },
  3: { title: "3단계 · 인증·시스템", description: "인증 취득·검증·시스템 구축 등 장기 과제" },
};

/** 판정 카운트 집계 (대시보드용) */
export function verdictCounts(indicators: Pick<IndicatorResult, "status">[]) {
  const counts = { 충족: 0, 부분충족: 0, 미충족: 0, 확인불가: 0 };
  for (const i of indicators) {
    if (i.status in counts) counts[i.status as keyof typeof counts] += 1;
  }
  return counts;
}
