// 로딩 스피너 — 모든 async 화면의 로딩 상태에 사용
export function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block h-5 w-5 animate-spin rounded-full border-2 border-line border-t-pine ${className}`}
      role="status"
      aria-label="로딩 중"
    />
  );
}

export function FullPageLoading({ message = "불러오는 중..." }: { message?: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-subtext">
      <Spinner />
      <p className="text-sm">{message}</p>
    </div>
  );
}
