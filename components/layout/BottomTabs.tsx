"use client";

// 모바일 하단 탭 — 사이드바 대체 (반응형 요구사항)

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./nav-items";

export function BottomTabs() {
  const pathname = usePathname();

  return (
    <nav className="print-hidden fixed inset-x-0 bottom-0 z-20 flex border-t border-line bg-surface md:hidden">
      {NAV_ITEMS.map((item) => {
        const active =
          item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${
              active ? "text-pine" : "text-subtext"
            }`}
          >
            <span aria-hidden className="text-base leading-none">
              {item.icon}
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
