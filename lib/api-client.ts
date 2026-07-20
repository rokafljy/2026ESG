"use client";

// 클라이언트 → API Route 호출 헬퍼
// 모든 요청에 Firebase ID 토큰을 Bearer 헤더로 첨부합니다.

import { clientAuth } from "@/lib/firebase/client";

export async function apiFetch<T = unknown>(path: string, body: unknown): Promise<T> {
  const user = clientAuth().currentUser;
  if (!user) throw new Error("로그인이 필요합니다.");

  const token = await user.getIdToken();
  const res = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      (data as { error?: string }).error ?? "요청 처리 중 오류가 발생했습니다."
    );
  }
  return data as T;
}
