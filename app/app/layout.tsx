"use client";

// /app 이하 보호 레이아웃 — 로그인하지 않으면 /login 으로 리다이렉트

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomTabs } from "@/components/layout/BottomTabs";
import { FullPageLoading } from "@/components/ui/Spinner";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <FullPageLoading message="로그인 상태를 확인하는 중..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <Sidebar />
      <BottomTabs />
      {/* 데스크톱: 사이드바 220px 만큼 밀기 / 모바일: 하단 탭 높이만큼 패딩 */}
      <main className="pb-20 md:ml-[220px] md:pb-8">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">{children}</div>
      </main>
    </div>
  );
}
