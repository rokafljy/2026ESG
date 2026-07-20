import { VERDICT_STYLES } from "@/lib/constants";

// 판정 배지 — 충족(green) / 부분충족(amber) / 미충족(red) / 확인불가(gray)
export function VerdictBadge({ status }: { status: string }) {
  const style = VERDICT_STYLES[status] ?? VERDICT_STYLES["확인불가"];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${style}`}
    >
      {status}
    </span>
  );
}

// 범용 배지 (카테고리 표시 등)
export function Badge({
  children,
  className = "bg-line text-subtext",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${className}`}
    >
      {children}
    </span>
  );
}
