// 모의등급 도넛 차트 — 의존성 없는 순수 SVG

export function DonutChart({
  value, // 0~100
  grade,
  size = 160,
}: {
  value: number;
  grade: string;
  size?: number;
}) {
  const stroke = 14;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, value));
  const dash = (clamped / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        {/* 배경 트랙 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#E4E8E3"
          strokeWidth={stroke}
        />
        {/* 값 아크 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#177452"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold text-pine-dk">{grade}</span>
        <span className="text-xs text-subtext">{clamped.toFixed(1)}점</span>
      </div>
    </div>
  );
}
