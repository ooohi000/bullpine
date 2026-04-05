import { BaseUrl } from '../baseUrl';

export const checkEmailService = async (email: string) => {
  const response = await fetch(
    `${BaseUrl}/api/auth/signup/check-email?email=${encodeURIComponent(email)}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    },
  );
  if (!response.ok) {
    throw new Error(`API 오류: ${response.statusText}`);
  }
  const data = await response.json();
  return data;
};
