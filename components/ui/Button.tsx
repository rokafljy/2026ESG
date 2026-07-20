"use client";

import Link from "next/link";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-pine text-white hover:bg-pine-dk disabled:bg-pine/40",
  secondary: "bg-surface text-ink border border-line hover:bg-bg",
  ghost: "text-pine hover:bg-pine-bg",
  danger: "bg-danger text-white hover:opacity-90",
};

const BASE =
  "inline-flex items-center justify-center gap-2 px-4 h-10 rounded-card text-sm font-semibold transition-colors disabled:cursor-not-allowed";

export function Button({
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button className={`${BASE} ${VARIANTS[variant]} ${className}`} {...props} />;
}

export function LinkButton({
  variant = "primary",
  className = "",
  href,
  children,
}: {
  variant?: Variant;
  className?: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={`${BASE} ${VARIANTS[variant]} ${className}`}>
      {children}
    </Link>
  );
}
