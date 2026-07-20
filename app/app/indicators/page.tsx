"use client";

// 지표별 진단 — 24개 지표 아코디언 + 필터 칩

import { useMemo, useState } from "react";
import { useLatestAssessment } from "@/lib/use-latest-assessment";
import { FilterChips, FILTERS, type Filter } from "@/components/indicators/FilterChips";
import { IndicatorAccordion } from "@/components/indicators/IndicatorAccordion";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { LinkButton, Button } from "@/components/ui/Button";
import { FullPageLoading } from "@/components/ui/Spinner";
import type { IndicatorResult } from "@/lib/types";

function matches(ind: IndicatorResult, filter: Filter): boolean {
  if (filter === "전체") return true;
  if (filter === "E" || filter === "S" || filter === "G") return ind.category === filter;
  return ind.status === filter;
}

export default function IndicatorsPage() {
  const { assessment, indicators, loading, error } = useLatestAssessment();
  const [filter, setFilter] = useState<Filter>("전체");

  const counts = useMemo(() => {
    const c = {} as Record<Filter, number>;
    for (const f of FILTERS) c[f] = indicators.filter((i) => matches(i, f)).length;
    return c;
  }, [indicators]);

  if (loading) return <FullPageLoading message="지표 진단 결과를 불러오는 중..." />;

  if (error) return <p className="text-sm text-danger">{error}</p>;

  if (!assessment || assessment.status !== "done") {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <h1 className="text-xl font-bold">
          {assessment?.status === "processing"
            ? "분석이 진행 중입니다"
            : "완료된 진단이 없습니다"}
        </h1>
        <p className="text-sm text-subtext">진단이 완료되면 24개 지표별 결과가 표시됩니다.</p>
        <LinkButton href="/app/new">새 진단 시작하기</LinkButton>
      </div>
    );
  }

  const filtered = indicators.filter((i) => matches(i, filter));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">지표별 진단</h1>
          <p className="mt-1 text-sm text-subtext">
            {assessment.companyName} · KCGS 24개 지표
          </p>
        </div>
        <Button variant="secondary" className="print-hidden" onClick={() => window.print()}>
          리포트 인쇄
        </Button>
      </div>

      <FilterChips active={filter} counts={counts} onChange={setFilter} />

      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-subtext">해당하는 지표가 없습니다.</p>
        ) : (
          filtered.map((ind) => (
            <IndicatorAccordion key={ind.id} assessmentId={assessment.id} indicator={ind} />
          ))
        )}
      </div>

      <Disclaimer />
    </div>
  );
}
