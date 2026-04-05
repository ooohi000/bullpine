import type { NextRequest } from 'next/server';

/**
 * 미들웨어에서 토큰 갱신 후, 같은 요청의 RSC/`cookies()`가 새 값을 보게
 * `Cookie` 요청 헤더를 재구성한다. (응답 `Set-Cookie`만으로는 들어온 요청 스냅샷이 안 바뀜)
 */
export function withMergedCookieHeader(
  request: NextRequest,
  overrides: Record<string, string>,
): Headers {
  const headers = new Headers(request.headers);
  const jar = new Map<string, string>();
  for (const { name, value } of request.cookies.getAll()) {
    jar.set(name, value);
  }
  for (const [name, value] of Object.entries(overrides)) {
    jar.set(name, value);
  }
  const cookie = Array.from(jar.entries())
    .map(([n, v]) => `${n}=${v}`)
    .join('; ');
  headers.set('cookie', cookie);
  return headers;
}
