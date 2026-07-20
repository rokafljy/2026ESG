// GRADE UP 공용 타입 정의 — Firestore 데이터 모델(명세서 5번)과 1:1 대응

import type { Timestamp } from "firebase/firestore";

/** 구독 플랜 — 결제 미구현, 관리자가 Firestore에서 수동 변경 */
export type Plan = "free" | "basic" | "pro";

/** ESG 카테고리 */
export type Category = "E" | "S" | "G";

/** 지표 판정 결과 */
export type Verdict = "충족" | "부분충족" | "미충족" | "확인불가";

/** 등급효과·난이도 3단계 */
export type Level = "상" | "중" | "하";

/** 진단 진행 상태 */
export type AssessmentStatus = "processing" | "done" | "error";

/** 분석 파이프라인 단계 — 5단계 진행 표시와 1:1 대응 */
export type ProgressStage = "parsed" | "E" | "S" | "G" | "priority";

/** users/{uid} 문서 */
export interface UserDoc {
  email: string;
  name: string;
  company: string;
  plan: Plan;
  createdAt: Timestamp;
}

/** 모의등급 점수 */
export interface Scores {
  E: number;
  S: number;
  G: number;
  avg: number;
  grade: string;
}

/** assessments/{id} 문서 */
export interface Assessment {
  id: string;
  uid: string;
  companyName: string;
  fileName: string;
  storagePath: string;
  createdAt: Timestamp;
  scores: Scores | null;
  status: AssessmentStatus;
  progressStage: ProgressStage;
  errorMessage?: string;
}

/** 개선과제 항목 — 로드맵 체크박스로 완료 처리 */
export interface ActionItem {
  text: string;
  done: boolean;
  doneAt?: Timestamp | null;
}

/** assessments/{id}/indicators/{indicatorId} 문서 */
export interface IndicatorResult {
  id: string; // E1~G8
  title: string;
  category: Category;
  criteria: string; // 만점기준
  status: Verdict;
  evidence: string; // 보고서 내 근거
  gap: string; // 만점기준 대비 부족한 점
  impact: Level; // 등급효과
  effort: Level; // 난이도
  actions: ActionItem[];
}

/** AI 응답에서 기대하는 지표별 판정 형태 (id 제외 필드는 서버가 보정) */
export interface AiIndicatorVerdict {
  id: string;
  status: Verdict;
  evidence: string;
  gap: string;
  impact: Level;
  effort: Level;
  actions: string[];
}
