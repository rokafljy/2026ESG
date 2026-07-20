// API Route 공용 인증/오류 헬퍼

import { adminAuth } from "./admin";

/** JSON 오류 응답 생성 (한국어 메시지) */
export function jsonError(status: number, message: string): Response {
  return Response.json({ error: message }, { status });
}

/**
 * Authorization: Bearer <ID token> 헤더를 검증하고 uid 를 반환합니다.
 * 실패 시 401 Response 를 throw — 라우트에서 catch 하여 그대로 반환하세요.
 */
export async function requireUser(req: Request): Promise<{ uid: string }> {
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    throw jsonError(401, "로그인이 필요합니다.");
  }
  try {
    const decoded = await adminAuth().verifyIdToken(token);
    return { uid: decoded.uid };
  } catch {
    throw jsonError(401, "로그인 세션이 만료되었습니다. 다시 로그인해 주세요.");
  }
}

/** throw 된 Response 또는 예기치 못한 오류를 일관된 응답으로 변환 */
export function toErrorResponse(err: unknown): Response {
  if (err instanceof Response) return err;
  console.error("[api] unexpected error:", err);
  return jsonError(500, "서버 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
}
