"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { authErrorMessage, signInWithEmail, signInWithGoogle } from "@/lib/auth-helpers";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await signInWithEmail(email, password);
      router.replace("/app");
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setError("");
    setBusy(true);
    try {
      await signInWithGoogle();
      router.replace("/app");
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="card w-full max-w-sm p-8">
        <Link href="/" className="text-lg font-extrabold text-pine-dk">
          GRADE <span className="text-pine">UP</span>
        </Link>
        <h1 className="mt-4 text-xl font-bold">로그인</h1>

        <form onSubmit={handleEmailLogin} className="mt-6 space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일"
            className="w-full rounded-card border border-line bg-surface px-3 h-10 text-sm outline-none focus:border-pine"
          />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            className="w-full rounded-card border border-line bg-surface px-3 h-10 text-sm outline-none focus:border-pine"
          />
          {error && <p className="text-xs text-danger">{error}</p>}
          <Button type="submit" disabled={busy} className="w-full">
            {busy ? "로그인 중..." : "이메일로 로그인"}
          </Button>
        </form>

        <div className="my-4 flex items-center gap-3 text-xs text-subtext">
          <span className="h-px flex-1 bg-line" />
          또는
          <span className="h-px flex-1 bg-line" />
        </div>

        <Button variant="secondary" onClick={handleGoogle} disabled={busy} className="w-full">
          Google로 계속하기
        </Button>

        <p className="mt-6 text-center text-xs text-subtext">
          아직 계정이 없으신가요?{" "}
          <Link href="/signup" className="font-semibold text-pine hover:underline">
            무료로 가입하기
          </Link>
        </p>
      </div>
    </div>
  );
}
