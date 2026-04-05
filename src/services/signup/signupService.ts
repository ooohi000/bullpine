import { BaseUrl } from '../baseUrl';

export const signupService = async (
  nickname: string,
  email: string,
  password: string,
) => {
  const response = await fetch(`${BaseUrl}/api/auth/signup`, {
    method: 'POST',
    body: JSON.stringify({ nickname, email, password }),
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
