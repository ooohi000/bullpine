import { BaseUrl } from '../baseUrl';

export const sendCodeService = async (email: string) => {
  const response = await fetch(`${BaseUrl}/api/auth/signup/send-code`, {
    method: 'POST',
    body: JSON.stringify({ email }),
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
