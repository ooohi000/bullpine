import {
  AUTH_ACCESS_TOKEN_COOKIE,
  AUTH_REFRESH_TOKEN_COOKIE,
} from '@/constants/authCookies';
import { cookies } from 'next/headers';

/**
 * httpOnly 액세스 토큰.
 * RSC · Server Action · Route Handler 등 서버에서만 사용 (클라이언트 번들에 넣지 말 것).
 */
export function getServerAccessToken(): string | undefined {
  return cookies().get(AUTH_ACCESS_TOKEN_COOKIE)?.value;
}

/**
 * httpOnly 액세스 토큰.
 * RSC · Server Action · Route Handler 등 서버에서만 사용 (클라이언트 번들에 넣지 말 것).
 */
export function getServerRefreshToken(): string | undefined {
  return cookies().get(AUTH_REFRESH_TOKEN_COOKIE)?.value;
}
/**
 * `BaseUrl` 백엔드로 `fetch`할 때 쓰는 기본 헤더. 토큰이 있을 때만 `Authorization` 추가.
 */
export function getBackendJsonRequestHeaders(): Record<string, string> {
  const token = getServerAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}
