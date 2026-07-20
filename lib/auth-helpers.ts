"use client";

// 로그인/가입 관련 클라이언트 헬퍼

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { clientAuth, clientDb, googleProvider } from "@/lib/firebase/client";

/**
 * 최초 로그인 시 users/{uid} 문서를 생성합니다.
 * 이미 문서가 있으면 아무것도 하지 않음 — 관리자가 수동 변경한 plan을 덮어쓰지 않기 위함.
 */
export async function ensureUserDoc(user: User, extra?: { name?: string; company?: string }) {
  const ref = doc(clientDb(), "users", user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return;

  await setDoc(ref, {
    email: user.email ?? "",
    name: extra?.name ?? user.displayName ?? "",
    company: extra?.company ?? "",
    plan: "free", // 결제 미구현 — 관리자가 Firestore에서 basic/pro로 수동 변경
    createdAt: serverTimestamp(),
  });
}

/** 이메일 회원가입 */
export async function signUpWithEmail(params: {
  email: string;
  password: string;
  name: string;
  company: string;
}) {
  const cred = await createUserWithEmailAndPassword(clientAuth(), params.email, params.password);
  await updateProfile(cred.user, { displayName: params.name });
  await ensureUserDoc(cred.user, { name: params.name, company: params.company });
  return cred.user;
}

/** 이메일 로그인 */
export async function signInWithEmail(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(clientAuth(), email, password);
  await ensureUserDoc(cred.user);
  return cred.user;
}

/** 구글 로그인 (가입 겸용) */
export async function signInWithGoogle() {
  const cred = await signInWithPopup(clientAuth(), googleProvider);
  await ensureUserDoc(cred.user);
  return cred.user;
}

/** Firebase Auth 오류 코드 → 한국어 메시지 */
export function authErrorMessage(err: unknown): string {
  const code = (err as { code?: string })?.code ?? "";
  const messages: Record<string, string> = {
    "auth/invalid-email": "이메일 형식이 올바르지 않습니다.",
    "auth/user-not-found": "가입되지 않은 이메일입니다.",
    "auth/wrong-password": "비밀번호가 올바르지 않습니다.",
    "auth/invalid-credential": "이메일 또는 비밀번호가 올바르지 않습니다.",
    "auth/email-already-in-use": "이미 가입된 이메일입니다.",
    "auth/weak-password": "비밀번호는 6자 이상이어야 합니다.",
    "auth/popup-closed-by-user": "로그인 창이 닫혔습니다. 다시 시도해 주세요.",
    "auth/too-many-requests": "시도 횟수가 많습니다. 잠시 후 다시 시도해 주세요.",
    "auth/network-request-failed": "네트워크 연결을 확인해 주세요.",
  };
  return messages[code] ?? "로그인 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";
}
