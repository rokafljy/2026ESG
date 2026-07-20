"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { authErrorMessage, signInWithGoogle, signUpWithEmail } from "@/lib/auth-helpers";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", company: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function update(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await signUpWithEmail(form);
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

  const inputClass =
    "w-full rounded-card border border-line bg-surface px-3 h-10 text-sm outline-none focus:border-pine";

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="card w-full max-w-sm p-8">
        <Link href="/" className="text-lg font-extrabold text-pine-dk">
          GRADE <span className="text-pine">UP</span>
        </Link>
        <h1 className="mt-4 text-xl font-bold">무료로 시작하기</h1>
        <p className="mt-1 text-xs text-subtext">가입 즉시 무료 진단 1회를 이용할 수 있습니다.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <input required value={form.name} onChange={update("name")} placeholder="이름" className={inputClass} />
          <input required value={form.company} onChange={update("company")} placeholder="회사명" className={inputClass} />
          <input type="email" required value={form.email} onChange={update("email")} placeholder="업무용 이메일" className={inputClass} />
          <input
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={update("password")}
            placeholder="비밀번호 (6자 이상)"
            className={inputClass}
          />
          {error && <p className="text-xs text-danger">{error}</p>}
          <Button type="submit" disabled={busy} className="w-full">
            {busy ? "가입 중..." : "가입하기"}
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
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="font-semibold text-pine hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
