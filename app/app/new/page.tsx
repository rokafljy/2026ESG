"use client";

// 새 진단 — 기업명 + PDF 업로드 → 5단계 분석 오케스트레이션
// 클라이언트가 단계별 API 를 순차 호출하므로 진행 표시가 실시간이며,
// 각 서버 호출은 Anthropic 1회로 제한되어 서버리스 타임아웃을 피합니다.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ref as storageRef, uploadBytesResumable } from "firebase/storage";
import { clientStorage } from "@/lib/firebase/client";
import { useAuth } from "@/components/providers/AuthProvider";
import { apiFetch } from "@/lib/api-client";
import { UploadDropzone } from "@/components/new/UploadDropzone";
import { ProgressSteps } from "@/components/new/ProgressSteps";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Disclaimer } from "@/components/ui/Disclaimer";

type Phase = "form" | "uploading" | "analyzing" | "error" | "done";

const ANALYZE_STAGES = ["E", "S", "G", "finalize"] as const;

export default function NewAssessmentPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [companyName, setCompanyName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");

  const [phase, setPhase] = useState<Phase>("form");
  const [uploadPercent, setUploadPercent] = useState(0);
  // 진행 단계: 0=보고서 인식, 1=E, 2=S, 3=G, 4=우선순위
  const [stepIndex, setStepIndex] = useState(0);
  const [errorStep, setErrorStep] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [assessmentId, setAssessmentId] = useState<string | null>(null);

  /** Storage 업로드 → 진단 생성(1단계) → 분석 2~5단계 순차 실행 */
  async function startAnalysis() {
    if (!user || !file || !companyName.trim()) return;

    setErrorMessage("");
    setErrorStep(null);
    setAssessmentId(null); // 이전 진단 ID 로 재시도되지 않도록 초기화
    setPhase("uploading");
    setUploadPercent(0);

    try {
      // 1) Storage 업로드 — uploads/{uid}/{timestamp}_{파일명}
      const path = `uploads/${user.uid}/${Date.now()}_${file.name}`;
      const task = uploadBytesResumable(storageRef(clientStorage(), path), file, {
        contentType: "application/pdf",
      });
      await new Promise<void>((resolve, reject) => {
        task.on(
          "state_changed",
          (snap) => setUploadPercent(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
          reject,
          () => resolve()
        );
      });

      // 2) 진단 생성 = 1단계(보고서 인식) — 플랜 제한·PDF 검증 포함
      setPhase("analyzing");
      setStepIndex(0);
      const { id } = await apiFetch<{ id: string }>("/api/assessments", {
        companyName: companyName.trim(),
        fileName: file.name,
        storagePath: path,
      });
      setAssessmentId(id);

      // 3) 2~5단계 순차 실행
      await runStages(id, 0);
    } catch (err) {
      failAt(0, err);
    }
  }

  /** stageOffset(0=E)부터 남은 분석 단계를 실행 — 재시도 시 실패 지점부터 재개 */
  async function runStages(id: string, stageOffset: number) {
    for (let i = stageOffset; i < ANALYZE_STAGES.length; i++) {
      setStepIndex(i + 1); // 화면 단계는 1(보고서 인식) 다음부터
      try {
        await apiFetch("/api/analyze", { assessmentId: id, stage: ANALYZE_STAGES[i] });
      } catch (err) {
        failAt(i + 1, err);
        return;
      }
    }
    setStepIndex(5);
    setPhase("done");
    router.push("/app");
  }

  function failAt(step: number, err: unknown) {
    setPhase("error");
    setErrorStep(step);
    setErrorMessage(err instanceof Error ? err.message : "분석 중 오류가 발생했습니다.");
  }

  /** 오류 지점부터 재시도 */
  async function retry() {
    if (!assessmentId || errorStep === null) {
      // 진단 생성 전에 실패한 경우 처음부터
      setPhase("form");
      return;
    }
    const resumeFrom = Math.max(0, errorStep - 1); // 화면 단계 → 분석 단계 오프셋
    setErrorStep(null);
    setErrorMessage("");
    setPhase("analyzing");
    await runStages(assessmentId, resumeFrom);
  }

  const isRunning = phase === "uploading" || phase === "analyzing";

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-bold">새 진단</h1>
      <p className="mt-1 text-sm text-subtext">
        지속가능경영보고서를 업로드하면 KCGS 24개 지표를 AI가 진단합니다.
      </p>

      <Card className="mt-6 p-6">
        {phase === "form" || phase === "error" ? (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              startAnalysis();
            }}
          >
            <div>
              <label htmlFor="companyName" className="mb-1 block text-sm font-semibold">
                기업명
              </label>
              <input
                id="companyName"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="예: 그레이드업 주식회사"
                className="w-full rounded-card border border-line bg-surface px-3 h-10 text-sm outline-none focus:border-pine"
              />
            </div>

            <div>
              <p className="mb-1 text-sm font-semibold">지속가능경영보고서 (PDF)</p>
              <UploadDropzone
                file={file}
                onSelect={setFile}
                onError={setFileError}
                disabled={isRunning}
              />
              {fileError && <p className="mt-1 text-xs text-danger">{fileError}</p>}
            </div>

            {phase === "error" && (
              <div className="rounded-card bg-danger/10 p-3">
                <p className="text-sm font-semibold text-danger">{errorMessage}</p>
                {assessmentId && (
                  <Button type="button" variant="danger" className="mt-2 h-8" onClick={retry}>
                    실패한 단계부터 재시도
                  </Button>
                )}
              </div>
            )}

            <Button type="submit" disabled={!file || !companyName.trim()} className="w-full">
              분석 시작
            </Button>
          </form>
        ) : (
          <div>
            <h2 className="text-base font-bold">
              {phase === "uploading" ? `보고서 업로드 중... ${uploadPercent}%` : "AI 분석 진행 중"}
            </h2>
            <p className="mt-1 text-xs text-subtext">
              분석에는 2~5분 정도 걸릴 수 있습니다. 화면을 닫지 마세요.
            </p>
            <div className="mt-5">
              <ProgressSteps
                currentIndex={phase === "uploading" ? -1 : stepIndex}
                errorIndex={errorStep}
              />
            </div>
          </div>
        )}
      </Card>

      <Disclaimer className="mt-4" />
    </div>
  );
}
