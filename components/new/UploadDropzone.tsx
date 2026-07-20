"use client";

// PDF 드래그앤드롭 업로드 존 — 클라이언트에서 형식/용량(30MB) 1차 검증
// (서버와 Storage Rules 에서 2차 검증)

import { useRef, useState } from "react";
import { MAX_FILE_SIZE } from "@/lib/constants";

export function UploadDropzone({
  file,
  onSelect,
  onError,
  disabled,
}: {
  file: File | null;
  onSelect: (file: File) => void;
  onError: (message: string) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function validateAndSelect(f: File | undefined) {
    if (!f) return;
    if (f.type !== "application/pdf") {
      onError("PDF 형식의 파일만 업로드할 수 있습니다.");
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      onError("파일 용량은 30MB 이하여야 합니다.");
      return;
    }
    onError("");
    onSelect(f);
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-disabled={disabled}
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={(e) => {
        if (!disabled && (e.key === "Enter" || e.key === " ")) inputRef.current?.click();
      }}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        if (!disabled) validateAndSelect(e.dataTransfer.files?.[0]);
      }}
      className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed px-6 py-10 text-center transition-colors ${
        dragging ? "border-pine bg-pine-bg" : "border-line bg-surface hover:border-pine/50"
      } ${disabled ? "pointer-events-none opacity-60" : ""}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => validateAndSelect(e.target.files?.[0])}
      />
      {file ? (
        <>
          <span className="text-2xl" aria-hidden>
            📄
          </span>
          <p className="text-sm font-semibold">{file.name}</p>
          <p className="text-xs text-subtext">
            {(file.size / 1024 / 1024).toFixed(1)}MB · 클릭하여 다른 파일 선택
          </p>
        </>
      ) : (
        <>
          <span className="text-2xl" aria-hidden>
            ⬆️
          </span>
          <p className="text-sm font-semibold">
            지속가능경영보고서 PDF를 끌어다 놓거나 클릭하여 선택
          </p>
          <p className="text-xs text-subtext">PDF · 최대 30MB</p>
        </>
      )}
    </div>
  );
}
