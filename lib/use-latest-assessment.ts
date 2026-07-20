"use client";

// 최신 진단 + 지표 24개 실시간 구독 훅 — 대시보드/지표/로드맵 화면 공용

import { useEffect, useState } from "react";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { clientDb } from "@/lib/firebase/client";
import { useAuth } from "@/components/providers/AuthProvider";
import type { Assessment, IndicatorResult } from "@/lib/types";

export function useLatestAssessment() {
  const { user } = useAuth();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [indicators, setIndicators] = useState<IndicatorResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 최신 진단 1건 구독
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(clientDb(), "assessments"),
      where("uid", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(1)
    );
    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        if (snap.empty) {
          setAssessment(null);
          setIndicators([]);
        } else {
          const doc = snap.docs[0];
          setAssessment({ id: doc.id, ...(doc.data() as Omit<Assessment, "id">) });
        }
        setLoading(false);
      },
      (err) => {
        console.error("[useLatestAssessment]", err);
        setError("진단 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [user]);

  // 진단의 지표 하위 컬렉션 구독 (로드맵 체크박스 변경도 실시간 반영)
  useEffect(() => {
    if (!assessment?.id) return;
    const unsubscribe = onSnapshot(
      collection(clientDb(), "assessments", assessment.id, "indicators"),
      (snap) => {
        const list = snap.docs.map((d) => d.data() as IndicatorResult);
        // E1~G8 순서 정렬 (카테고리 E→S→G, 번호순)
        const order = { E: 0, S: 1, G: 2 } as const;
        list.sort((a, b) =>
          order[a.category] !== order[b.category]
            ? order[a.category] - order[b.category]
            : Number(a.id.slice(1)) - Number(b.id.slice(1))
        );
        setIndicators(list);
      },
      (err) => console.error("[useLatestAssessment:indicators]", err)
    );
    return unsubscribe;
  }, [assessment?.id]);

  return { assessment, indicators, loading, error };
}
