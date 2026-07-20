"use client";

// 개선과제 체크박스 완료 처리 — Firestore indicators 문서의 actions 필드만 갱신
// (Security Rules 에서 actions 외 필드 변경은 차단됨)

import { doc, Timestamp, updateDoc } from "firebase/firestore";
import { clientDb } from "@/lib/firebase/client";
import type { ActionItem } from "@/lib/types";

export async function toggleAction(
  assessmentId: string,
  indicatorId: string,
  actions: ActionItem[],
  index: number
): Promise<void> {
  const next = actions.map((a, i) =>
    i === index
      ? { text: a.text, done: !a.done, doneAt: !a.done ? Timestamp.now() : null }
      : { text: a.text, done: a.done, doneAt: a.doneAt ?? null }
  );
  await updateDoc(doc(clientDb(), "assessments", assessmentId, "indicators", indicatorId), {
    actions: next,
  });
}
