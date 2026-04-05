import { BaseUrl } from '../baseUrl';

export const checkNicknameService = async (nickname: string) => {
  const response = await fetch(
    `${BaseUrl}/api/auth/signup/check-nickname?nickname=${encodeURIComponent(nickname)}`,
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
