import { BaseUrl } from '../baseUrl';

export const verifyCodeService = async (email: string, code: string) => {
  const response = await fetch(`${BaseUrl}/api/auth/signup/verify-code`, {
    method: 'POST',
    body: JSON.stringify({ email, code }),
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error(`API 오류: ${response.statusText}`);
  }
  const data = await response.json();
  return data;
};
