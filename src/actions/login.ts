'use server';

import { redirect } from 'next/navigation';
import { BaseUrl } from '@/services';
import { setAuthCookiesInHeadersJar } from '@/lib/authCookieOptions';
import { loginSchema } from '@/components/login/loginSchema';
import { loginService } from '@/services/auth/loginService';

export type LoginActionResult = {
  success: boolean;
  error?: string;
  message?: string;
};

const assertBaseUrl = (): string | null => {
  if (!BaseUrl) {
    return null;
  }
  return BaseUrl;
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return '요청 처리 중 오류가 발생했습니다.';
};

/**
 * RHF `handleSubmit`에서 객체로 호출.
 * 성공 시 토큰은 httpOnly 쿠키에만 저장( XSS 시 스크립트로 읽기 어려움 ) 후 redirect.
 */
/** 성공 시 `redirect()`로 반환값 없이 종료 → 클라이언트에서는 `undefined`일 수 있음 */
export async function loginAction(
  payload: unknown,
): Promise<LoginActionResult | undefined> {
  const parsed = loginSchema.safeParse(payload);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? '입력값을 확인해주세요.';
    return { success: false, error: first };
  }

  const { email, password } = parsed.data;

  if (!assertBaseUrl()) {
    return { success: false, error: 'API 주소가 설정되지 않았습니다.' };
  }

  let tokens: Awaited<ReturnType<typeof loginService>>;
  try {
    tokens = await loginService(email, password);
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }

  setAuthCookiesInHeadersJar(tokens);

  redirect('/companies');
}
