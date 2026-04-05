import type { LoginResponse, LoginSuccessData } from '@/types/auth/login';
import { BaseUrl } from '../baseUrl';

export const loginService = async (
  email: string,
  password: string,
): Promise<LoginSuccessData> => {
  const response = await fetch(`${BaseUrl}/api/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password, clientType: 'WEB' }),
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error(`API 오류: ${response.statusText}`);
  }
  const result = (await response.json()) as LoginResponse;
  if (!result.success) {
    throw new Error('로그인 응답이 올바르지 않습니다.');
  }
  const data = result.data;
  if (!data?.accessToken || !data?.refreshToken) {
    throw new Error('로그인 토큰이 응답에 없습니다.');
  }
  return data;
};
