import { AUTH_ACCESS_TOKEN_COOKIE } from '@/constants/authCookies';
import { cookies } from 'next/headers';

/** RSC·Layout·Route Handler에서 액세스 토큰 쿠키 존재 여부 */
export function isAuthenticated(): boolean {
  return Boolean(cookies().get(AUTH_ACCESS_TOKEN_COOKIE)?.value);
}
