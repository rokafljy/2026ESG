import { DISCLAIMER } from "@/lib/constants";

// 모든 결과 화면·리포트에 고정 표기하는 면책 문구
export function Disclaimer({ className = "" }: { className?: string }) {
  return (
    <p className={`text-xs text-subtext ${className}`}>
      ⓘ {DISCLAIMER}
    </p>
  );
}
