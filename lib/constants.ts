// GRADE UP 전역 상수

import type { Plan, ProgressStage } from "./types";

/** 모든 결과 화면·리포트에 고정 표기하는 면책 문구 (명세서 6번) */
export const DISCLAIMER =
  "KCGS 모범규준 공개체계 기반 자체 모의진단이며 공식 평가와 다를 수 있습니다";

/** PDF 업로드 용량 제한: 30MB */
export const MAX_FILE_SIZE = 30 * 1024 * 1024;

/** 플랜별 진단 횟수 제한 — 서버 사이드(API Route)에서 검증 */
export const PLAN_LIMITS: Record<Plan, { label: string; perYear: number | null; description: string }> = {
  free: { label: "Free", perYear: null, description: "진단 1회 (총 1회)" },
  basic: { label: "Basic", perYear: 2, description: "연 2회 진단" },
  pro: { label: "Pro", perYear: Infinity, description: "무제한 진단 + 개선과제 관리" },
};

/** 분석 진행 5단계 — UI 표시 순서 */
export const STAGES: { key: ProgressStage; label: string }[] = [
  { key: "parsed", label: "보고서 인식" },
  { key: "E", label: "환경(E) 진단" },
  { key: "S", label: "사회(S) 진단" },
  { key: "G", label: "지배구조(G) 진단" },
  { key: "priority", label: "우선순위 산출" },
];

/** 판정별 배지 색상 클래스 (Tailwind) */
export const VERDICT_STYLES: Record<string, string> = {
  충족: "bg-pine-bg text-pine",
  부분충족: "bg-amber/10 text-amber",
  미충족: "bg-danger/10 text-danger",
  확인불가: "bg-line text-subtext",
};

/** 카테고리 한글명 */
export const CATEGORY_LABELS: Record<string, string> = {
  E: "환경",
  S: "사회",
  G: "지배구조",
};
