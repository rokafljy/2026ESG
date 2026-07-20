"use client";

// 데스크톱 좌측 다크(pine-dk) 사이드바 220px — 모바일에서는 숨기고 BottomTabs 사용

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { clientAuth } from "@/lib/firebase/client";
import { useAuth } from "@/components/providers/AuthProvider";
import { NAV_ITEMS } from "./nav-items";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  async function handleSignOut() {
    await signOut(clientAuth());
    router.replace("/");
  }

  return (
    <aside className="print-hidden fixed inset-y-0 left-0 z-20 hidden w-[220px] flex-col bg-pine-dk text-white md:flex">
      <div className="px-5 py-6">
        <Link href="/app" className="text-lg font-extrabold tracking-tight">
          GRADE <span className="text-pine-bg">UP</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-card px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? "bg-pine text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span aria-hidden>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <p className="truncate text-xs text-white/60">{user?.email}</p>
        <button
          onClick={handleSignOut}
          className="mt-2 text-xs font-medium text-white/70 hover:text-white"
        >
          로그아웃
        </button>
      </div>
    </aside>
  );
}
