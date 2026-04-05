import { BaseUrl } from '@/services/baseUrl';
import type { LoginSuccessData } from '@/types/auth/login';

/**
 * 업스트림 인증 서버에 refresh 토큰을 보내 새 access/refresh 쌍을 받음.
 * 미들웨어에서만 사용 (BFF 라우트 없이 업스트림 직결 — Edge에서도 `BASE_URL` 등이 주입되면 동작).
 */
export async function exchangeRefreshToken(
  refreshToken: string,
): Promise<LoginSuccessData | null> {
  if (!BaseUrl) return null;
  const url = `${BaseUrl.replace(/\/$/, '')}/api/auth/refresh`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    if (!response.ok) return null;
    const result = (await response.json()) as { data?: LoginSuccessData };
    if (!result.data?.accessToken || !result.data?.refreshToken) return null;
    return result.data;
  } catch {
    return null;
  }
}
