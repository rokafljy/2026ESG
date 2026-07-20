// Anthropic API 호출 (서버 전용) — API 키는 환경변수 ANTHROPIC_API_KEY 로만 관리
// 이 모듈은 절대 클라이언트 번들에 포함되면 안 됩니다 ("server-only" 가드).

import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { buildCategoryPrompt, JSON_RETRY_REMINDER, SYSTEM_PROMPT } from "./prompts";
import { indicatorsByCategory } from "./indicators";
import type { AiIndicatorVerdict, Category, Level, Verdict } from "./types";

export const MODEL = "claude-sonnet-4-6";

let client: Anthropic | undefined;

function anthropic(): Anthropic {
  if (!client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다.");
    }
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

/** 응답 텍스트에서 JSON 추출 — 코드펜스 제거 후 첫 '{' ~ 마지막 '}' 구간 파싱 */
export function extractJson(text: string): unknown {
  const stripped = text.replace(/```(?:json)?/g, "").trim();
  const start = stripped.indexOf("{");
  const end = stripped.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("응답에서 JSON을 찾을 수 없습니다.");
  }
  return JSON.parse(stripped.slice(start, end + 1));
}

const VALID_VERDICTS: Verdict[] = ["충족", "부분충족", "미충족", "확인불가"];
const VALID_LEVELS: Level[] = ["상", "중", "하"];

/** AI 응답을 검증·보정 — 알 수 없는 값은 안전한 기본값으로 강제 */
function normalizeResults(raw: unknown, category: Category): AiIndicatorVerdict[] {
  const results = (raw as { results?: unknown })?.results;
  if (!Array.isArray(results)) {
    throw new Error("응답 JSON에 results 배열이 없습니다.");
  }

  const byId = new Map<string, Record<string, unknown>>();
  for (const item of results) {
    if (item && typeof item === "object" && typeof (item as { id?: unknown }).id === "string") {
      byId.set((item as { id: string }).id, item as Record<string, unknown>);
    }
  }

  // 카테고리의 8개 지표 전부에 대해 결과를 구성 — 누락 지표는 "확인불가"로 보정
  return indicatorsByCategory(category).map((def) => {
    const r = byId.get(def.id) ?? {};
    const status = VALID_VERDICTS.includes(r.status as Verdict)
      ? (r.status as Verdict)
      : "확인불가";
    const impact = VALID_LEVELS.includes(r.impact as Level) ? (r.impact as Level) : "중";
    const effort = VALID_LEVELS.includes(r.effort as Level) ? (r.effort as Level) : "중";
    const actions = Array.isArray(r.actions)
      ? (r.actions as unknown[]).filter((a): a is string => typeof a === "string").slice(0, 3)
      : [];

    return {
      id: def.id,
      status,
      evidence: typeof r.evidence === "string" ? r.evidence : "",
      gap: typeof r.gap === "string" ? r.gap : "",
      impact,
      effort,
      actions,
    };
  });
}

/**
 * 카테고리(E/S/G) 1회 분석 — PDF document block + 카테고리 프롬프트로 호출.
 * JSON 파싱·검증 실패 시 1회 재시도합니다.
 */
export async function analyzeCategory(
  pdfBase64: string,
  category: Category
): Promise<AiIndicatorVerdict[]> {
  const userContent: Anthropic.ContentBlockParam[] = [
    {
      type: "document",
      source: { type: "base64", media_type: "application/pdf", data: pdfBase64 },
    },
    { type: "text", text: buildCategoryPrompt(category) },
  ];

  const messages: Anthropic.MessageParam[] = [{ role: "user", content: userContent }];

  for (let attempt = 0; attempt < 2; attempt++) {
    const response = await anthropic().messages.create({
      model: MODEL,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages,
    });

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    try {
      return normalizeResults(extractJson(text), category);
    } catch (err) {
      if (attempt === 1) throw err;
      // 1회 재시도 — 직전 응답과 JSON-only 리마인더를 대화에 추가
      console.warn(`[analyze:${category}] JSON 파싱 실패, 재시도합니다.`, err);
      messages.push(
        { role: "assistant", content: text.slice(0, 2000) || "(빈 응답)" },
        { role: "user", content: JSON_RETRY_REMINDER }
      );
    }
  }

  // 도달 불가 — 타입 안전을 위한 방어
  throw new Error("분석 응답 처리에 실패했습니다.");
}
