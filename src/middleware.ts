import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  AUTH_ACCESS_TOKEN_COOKIE,
  AUTH_REFRESH_TOKEN_COOKIE,
} from '@/constants/authCookies';
import { exchangeRefreshToken } from '@/lib/auth/exchangeRefreshToken';
import { setAuthCookiesOnNextResponse } from '@/lib/authCookieOptions';
import { withMergedCookieHeader } from '@/lib/middlewareRequestCookies';

/**
 * 로그인된 사용자(액세스 토큰 쿠키 있음)는 랜딩·회원가입 대신 /companies 로 보냄.
 * matcher에 걸린 모든 경로에서: access 없고 refresh만 있으면 갱신(예: `/`, `/signup`, `/companies` 동일).
 * `next()` 경로는 요청 `Cookie` 헤더까지 갱신해 같은 요청의 layout `cookies()`와 맞춤.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const access = request.cookies.get(AUTH_ACCESS_TOKEN_COOKIE)?.value;
  const refresh = request.cookies.get(AUTH_REFRESH_TOKEN_COOKIE)?.value;

  if (!access && refresh) {
    const tokens = await exchangeRefreshToken(refresh);
    if (tokens) {
      const cookieOverrides = {
        [AUTH_ACCESS_TOKEN_COOKIE]: tokens.accessToken,
        [AUTH_REFRESH_TOKEN_COOKIE]: tokens.refreshToken,
      };
      const goCompanies = pathname === '/' || pathname === '/signup';
      const res = goCompanies
        ? NextResponse.redirect(new URL('/companies', request.url))
        : NextResponse.next({
            request: {
              headers: withMergedCookieHeader(request, cookieOverrides),
            },
          });
      setAuthCookiesOnNextResponse(res, tokens);
      return res;
    }
  }

  if (access && (pathname === '/' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/companies', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/signup', '/companies', '/companies/:path*'],
};
