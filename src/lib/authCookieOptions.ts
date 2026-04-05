import { cookies } from 'next/headers';
import type { NextResponse } from 'next/server';
import {
  ACCESS_TOKEN_MAX_AGE_SEC,
  AUTH_ACCESS_TOKEN_COOKIE,
  AUTH_REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_MAX_AGE_SEC,
} from '@/constants/authCookies';
import type { LoginSuccessData } from '@/types/auth/login';

const isProd = process.env.NODE_ENV === 'production';

const accessOpts = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: ACCESS_TOKEN_MAX_AGE_SEC,
};

const refreshOpts = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: REFRESH_TOKEN_MAX_AGE_SEC,
};

export function setAuthCookiesOnNextResponse(
  res: NextResponse,
  tokens: LoginSuccessData,
) {
  res.cookies.set(AUTH_ACCESS_TOKEN_COOKIE, tokens.accessToken, accessOpts);
  res.cookies.set(AUTH_REFRESH_TOKEN_COOKIE, tokens.refreshToken, refreshOpts);
}

/** Server Action 등 `next/headers` cookies() */
export function setAuthCookiesInHeadersJar(tokens: LoginSuccessData) {
  const jar = cookies();
  jar.set(AUTH_ACCESS_TOKEN_COOKIE, tokens.accessToken, accessOpts);
  jar.set(AUTH_REFRESH_TOKEN_COOKIE, tokens.refreshToken, refreshOpts);
}

/** 로그아웃·세션 무효화 시 httpOnly 인증 쿠키 제거 */
export function clearAuthCookies() {
  const jar = cookies();
  jar.delete(AUTH_ACCESS_TOKEN_COOKIE);
  jar.delete(AUTH_REFRESH_TOKEN_COOKIE);
}
