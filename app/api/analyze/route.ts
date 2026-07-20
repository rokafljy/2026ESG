// POST /api/analyze — 분석 파이프라인 (2~5단계)
// body: { assessmentId, stage: "E" | "S" | "G" | "finalize" }
// 클라이언트(/app/new)가 단계별로 순차 호출하며, 각 호출은 Anthropic API 1회만 사용해
// 서버리스 함수 타임아웃 안에서 안전하게 완료됩니다. 각 단계는 멱등(재실행 시 덮어쓰기)입니다.

import { adminBucket, adminDb } from "@/lib/firebase/admin";
import { jsonError, requireUser, toErrorResponse } from "@/lib/firebase/admin-auth";
import { analyzeCategory } from "@/lib/anthropic";
import { getIndicatorDef, INDICATORS } from "@/lib/indicators";
import { categoryScore, gradeFromAvg } from "@/lib/scoring";
import type { Category, IndicatorResult, Verdict } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120; // Anthropic 호출 여유 시간

const CATEGORY_STAGES: Category[] = ["E", "S", "G"];

export async function POST(req: Request) {
  const db = adminDb();
  let assessmentRef: FirebaseFirestore.DocumentReference | null = null;

  try {
    const { uid } = await requireUser(req);

    const body = (await req.json().catch(() => ({}))) as {
      assessmentId?: string;
      stage?: string;
    };
    const { assessmentId, stage } = body;
    if (!assessmentId || !stage) {
      throw jsonError(400, "assessmentId 와 stage 를 지정해 주세요.");
    }
    if (![...CATEGORY_STAGES, "finalize"].includes(stage as Category | "finalize")) {
      throw jsonError(400, "stage 는 E, S, G, finalize 중 하나여야 합니다.");
    }

    assessmentRef = db.collection("assessments").doc(assessmentId);
    const snap = await assessmentRef.get();
    if (!snap.exists) throw jsonError(404, "진단을 찾을 수 없습니다.");
    const assessment = snap.data()!;
    // 소유권 검증 — Admin SDK 는 Security Rules 를 우회하므로 서버에서 직접 확인
    if (assessment.uid !== uid) throw jsonError(403, "본인의 진단만 분석할 수 있습니다.");

    if (stage === "finalize") {
      // ── 5단계: 우선순위 산출 (AI 미사용, 순수 계산) ──
      const indSnap = await assessmentRef.collection("indicators").get();
      const indicators = indSnap.docs.map((d) => d.data() as IndicatorResult);
      if (indicators.length < INDICATORS.length) {
        throw jsonError(409, "카테고리 분석이 아직 완료되지 않았습니다. 다시 시도해 주세요.");
      }

      const byCat = (c: Category) => indicators.filter((i) => i.category === c);
      const E = categoryScore(byCat("E"));
      const S = categoryScore(byCat("S"));
      const G = categoryScore(byCat("G"));
      const avg = Math.round(((E + S + G) / 3) * 10) / 10;

      await assessmentRef.update({
        scores: { E, S, G, avg, grade: gradeFromAvg(avg) },
        status: "done",
        progressStage: "priority",
        errorMessage: null,
      });
      return Response.json({ ok: true, stage });
    }

    // ── 2~4단계: 카테고리(E/S/G)별 AI 분석 ──
    const category = stage as Category;

    // Storage 에서 PDF 다운로드 → base64 변환
    const [buffer] = await adminBucket().file(assessment.storagePath).download();
    const pdfBase64 = buffer.toString("base64");

    const results = await analyzeCategory(pdfBase64, category);

    // 지표 8개를 하위 컬렉션에 일괄 기록 (재실행 시 덮어쓰기 — 멱등)
    const batch = db.batch();
    for (const r of results) {
      const def = getIndicatorDef(r.id)!;
      const doc: Omit<IndicatorResult, "status"> & { status: Verdict } = {
        id: def.id,
        title: def.title,
        category: def.category,
        criteria: def.criteria,
        status: r.status,
        evidence: r.evidence,
        gap: r.gap,
        impact: r.impact,
        effort: r.effort,
        actions: r.actions.map((text) => ({ text, done: false, doneAt: null })),
      };
      batch.set(assessmentRef.collection("indicators").doc(def.id), doc);
    }
    batch.update(assessmentRef, { progressStage: category, errorMessage: null });
    await batch.commit();

    return Response.json({ ok: true, stage });
  } catch (err) {
    // 분석 실패 시 진단 문서에 오류 상태 기록 (인증/소유권 오류 제외)
    if (assessmentRef && !(err instanceof Response)) {
      await assessmentRef
        .update({
          status: "error",
          errorMessage: "분석 중 오류가 발생했습니다. 다시 시도해 주세요.",
        })
        .catch(() => {});
    }
    return toErrorResponse(err);
  }
}
