// 앱 내비게이션 항목 — Sidebar(데스크톱)와 BottomTabs(모바일)가 공유

export const NAV_ITEMS = [
  { href: "/app", label: "대시보드", icon: "📊" },
  { href: "/app/new", label: "새 진단", icon: "📄" },
  { href: "/app/indicators", label: "지표별 진단", icon: "🔍" },
  { href: "/app/roadmap", label: "개선 로드맵", icon: "🗺️" },
] as const;
