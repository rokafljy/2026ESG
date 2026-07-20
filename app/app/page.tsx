"use client";

// 대시보드 — 최신 진단 요약: 모의등급 도넛, E·S·G 게이지, 판정 카운트, Quick Win TOP 5

import { useLatestAssessment } from "@/lib/use-latest-assessment";
import { DonutChart } from "@/components/charts/DonutChart";
import { GaugeBar } from "@/components/charts/GaugeBar";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { QuickWinList } from "@/components/dashboard/QuickWinList";
import { Card, CardTitle } from "@/components/ui/Card";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { LinkButton } from "@/components/ui/Button";
import { FullPageLoading } from "@/components/ui/Spinner";

export default function DashboardPage() {
  const { assessment, indicators, loading, error } = useLatestAssessment();

  if (loading) return <FullPageLoading message="최신 진단을 불러오는 중..." />;

  if (error) {
    return (
      <Card className="p-6">
        <p className="text-sm text-danger">{error}</p>
      </Card>
    );
  }

  // 빈 상태 — 아직 진단 없음
  if (!assessment) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-4xl" aria-hidden>
          📄
        </p>
        <h1 className="text-xl font-bold">아직 진단이 없습니다</h1>
        <p className="max-w-sm text-sm text-subtext">
          지속가능경영보고서 PDF를 업로드하면 5분 안에 KCGS 24개 지표 진단 결과를
          받아볼 수 있습니다.
        </p>
        <LinkButton href="/app/new">첫 진단 시작하기</LinkButton>
      </div>
    );
  }

  // 처리중/오류 상태
  if (assessment.status !== "done") {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        {assessment.status === "processing" ? (
          <>
            <FullPageLoading message={`${assessment.companyName} 보고서를 분석하고 있습니다...`} />
            <LinkButton href="/app/new" variant="secondary">
              진행 상태 보기
            </LinkButton>
          </>
        ) : (
          <>
            <p className="text-4xl" aria-hidden>
              ⚠️
            </p>
            <h1 className="text-xl font-bold">분석 중 오류가 발생했습니다</h1>
            <p className="text-sm text-subtext">
              {assessment.errorMessage ?? "다시 진단을 시도해 주세요."}
            </p>
            <LinkButton href="/app/new">다시 진단하기</LinkButton>
          </>
        )}
      </div>
    );
  }

  const scores = assessment.scores;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">대시보드</h1>
          <p className="mt-1 text-sm text-subtext">
            {assessment.companyName} · {assessment.fileName}
          </p>
        </div>
        <LinkButton href="/app/new" variant="secondary" className="print-hidden">
          새 진단
        </LinkButton>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* 모의등급 도넛 */}
        <Card className="flex flex-col items-center gap-3 p-6">
          <CardTitle className="self-start">모의등급</CardTitle>
          <DonutChart value={scores?.avg ?? 0} grade={scores?.grade ?? "-"} />
        </Card>

        {/* E·S·G 게이지 */}
        <Card className="flex flex-col justify-center gap-5 p-6">
          <CardTitle>E·S·G 충족률</CardTitle>
          <GaugeBar category="E" value={scores?.E ?? 0} />
          <GaugeBar category="S" value={scores?.S ?? 0} />
          <GaugeBar category="G" value={scores?.G ?? 0} />
        </Card>
      </div>

      {/* 판정 카운트 */}
      <SummaryCards indicators={indicators} />

      {/* Quick Win TOP 5 */}
      <Card className="p-6">
        <CardTitle>Quick Win TOP 5</CardTitle>
        <p className="mt-0.5 text-xs text-subtext">
          등급효과 대비 난이도가 낮아 지금 착수하면 좋은 개선과제입니다.
        </p>
        <div className="mt-3">
          <QuickWinList indicators={indicators} />
        </div>
      </Card>

      <Disclaimer />
    </div>
  );
}
