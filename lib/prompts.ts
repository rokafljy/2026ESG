// AI 분석 프롬프트 (서버 전용) — 명세서 6번의 판정 원칙을 그대로 반영

import { indicatorsByCategory } from "./indicators";
import { CATEGORY_LABELS } from "./constants";
import type { Category } from "./types";

/** 시스템 프롬프트 — 판정 원칙 5가지 */
export const SYSTEM_PROMPT = `당신은 KCGS(한국ESG기준원) ESG 평가 전문 애널리스트입니다. 기업의 지속가능경영보고서 PDF를 읽고, 제시된 평가지표별로 충족 여부를 판정합니다.

반드시 다음 원칙을 지키세요:
1. 보고서에 명시적 근거가 있을 때만 "충족" 또는 "부분충족"으로 판정합니다. 추정하거나 일반적 관행을 근거로 삼는 것은 금지입니다.
2. 근거가 없으면 "미충족", 자료의 성격상 판단이 불가능하면 "확인불가"로 판정합니다.
3. gap: 만점기준 대비 부족한 점을 구체적으로 서술합니다.
4. actions: 만점 달성을 위한 실행과제를 2~3개 제시합니다. "문서 제정", "데이터 공개", "인증 취득" 등 실행 가능한 구체적 수준으로 작성하세요.
5. impact는 등급효과(상/중/하), effort는 난이도입니다 — 방침·문서 수립=하, 데이터 체계 구축=중, 인증·검증·시스템 구축=상.

응답은 반드시 JSON만 출력합니다. JSON 외의 설명, 인사말, 마크다운 코드펜스를 포함하지 마세요.`;

/** 카테고리별 사용자 프롬프트 — 해당 카테고리 8개 지표와 만점기준을 나열 */
export function buildCategoryPrompt(category: Category): string {
  const items = indicatorsByCategory(category)
    .map((i) => `- ${i.id} ${i.title}\n  만점기준: ${i.criteria}`)
    .join("\n");

  return `첨부된 지속가능경영보고서를 분석하여, 아래 ${CATEGORY_LABELS[category]}(${category}) 영역 평가지표 8개 각각에 대해 판정하세요.

[평가지표]
${items}

[출력 형식]
다음 스키마의 JSON 객체 하나만 출력하세요:
{
  "results": [
    {
      "id": "지표 ID (예: ${category}1)",
      "status": "충족" | "부분충족" | "미충족" | "확인불가",
      "evidence": "보고서 내 근거 (페이지·섹션·수치 등 구체적으로. 근거가 없으면 빈 문자열)",
      "gap": "만점기준 대비 부족한 점 (충족이면 빈 문자열)",
      "impact": "상" | "중" | "하",
      "effort": "상" | "중" | "하",
      "actions": ["만점 달성 실행과제 2~3개"]
    }
  ]
}

results 배열에는 반드시 ${category}1부터 ${category}8까지 8개 지표가 모두 포함되어야 합니다.`;
}

/** JSON 파싱 실패 시 재시도에 덧붙이는 지시문 */
export const JSON_RETRY_REMINDER =
  "직전 응답을 JSON으로 파싱할 수 없었습니다. 설명이나 코드펜스 없이, 지정된 스키마의 JSON 객체 하나만 다시 출력하세요.";
