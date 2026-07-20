// POST /api/assessments — 진단 생성 (분석 1단계: 보고서 인식)
// 1) ID 토큰 검증  2) 플랜별 횟수 제한 검증  3) 업로드된 PDF 검증  4) assessment 문서 생성

import { FieldValue } from "firebase-admin/firestore";
import { adminBucket, adminDb } from "@/lib/firebase/admin";
import { jsonError, requireUser, toErrorResponse } from "@/lib/firebase/admin-auth";
import { MAX_FILE_SIZE } from "@/lib/constants";
import type { Plan } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** 플랜별 진단 횟수 제한 검증 — 서버 사이드에서만 수행 (클라이언트 조작 불가) */
async function assertPlanQuota(uid: string): Promise<void> {
  const db = adminDb();
  const userSnap = await db.collection("users").doc(uid).get();
  const plan = (userSnap.data()?.plan ?? "free") as Plan;

  if (plan === "pro") return; // 무제한

  if (plan === "free") {
    const { count } = (
      await db.collection("assessments").where("uid", "==", uid).count().get()
    ).data();
    if (count >= 1) {
      throw jsonError(
        403,
        "무료 플랜은 진단을 1회만 이용할 수 있습니다. Basic/Pro 플랜으로 업그레이드해 주세요."
      );
    }
    return;
  }

  // basic: 올해 1월 1일 이후 생성된 진단 2회 제한
  const yearStart = new Date(new Date().getFullYear(), 0, 1);
  const { count } = (
    await db
      .collection("assessments")
      .where("uid", "==", uid)
      .where("createdAt", ">=", yearStart)
      .count()
      .get()
  ).data();
  if (count >= 2) {
    throw jsonError(
      403,
      "Basic 플랜은 연 2회까지 진단할 수 있습니다. 무제한 진단은 Pro 플랜을 이용해 주세요."
    );
  }
}

export async function POST(req: Request) {
  try {
    const { uid } = await requireUser(req);

    const body = (await req.json().catch(() => ({}))) as {
      companyName?: string;
      fileName?: string;
      storagePath?: string;
    };
    const companyName = body.companyName?.trim();
    const fileName = body.fileName?.trim();
    const storagePath = body.storagePath?.trim();

    if (!companyName || !fileName || !storagePath) {
      throw jsonError(400, "기업명과 보고서 파일 정보를 모두 입력해 주세요.");
    }
    // 본인 업로드 경로만 허용 — 타인 파일 경로 지정 차단
    if (!storagePath.startsWith(`uploads/${uid}/`)) {
      throw jsonError(403, "본인이 업로드한 파일만 진단할 수 있습니다.");
    }

    await assertPlanQuota(uid);

    // Storage 에 실제 PDF 가 존재하는지 + 용량/형식 검증
    const file = adminBucket().file(storagePath);
    const [exists] = await file.exists();
    if (!exists) {
      throw jsonError(400, "업로드된 파일을 찾을 수 없습니다. 다시 업로드해 주세요.");
    }
    const [meta] = await file.getMetadata();
    const size = Number(meta.size ?? 0);
    if (size > MAX_FILE_SIZE) {
      throw jsonError(400, "PDF 파일은 30MB 이하만 진단할 수 있습니다.");
    }
    if (meta.contentType !== "application/pdf") {
      throw jsonError(400, "PDF 형식의 파일만 진단할 수 있습니다.");
    }

    const ref = await adminDb().collection("assessments").add({
      uid,
      companyName,
      fileName,
      storagePath,
      createdAt: FieldValue.serverTimestamp(),
      scores: null,
      status: "processing",
      progressStage: "parsed",
    });

    return Response.json({ id: ref.id });
  } catch (err) {
    return toErrorResponse(err);
  }
}
