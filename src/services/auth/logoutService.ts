import {
  getBackendJsonRequestHeaders,
  getServerRefreshToken,
} from '@/lib/server/getBackendRequestHeaders';
import { BaseUrl } from '../baseUrl';
import { LogoutResponse } from '@/types';

export const logoutService = async (): Promise<LogoutResponse> => {
  const response = await fetch(`${BaseUrl}/api/auth/logout`, {
    method: 'POST',
    body: JSON.stringify({ refreshToken: getServerRefreshToken() }),
    headers: getBackendJsonRequestHeaders(),
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error(`API 오류: ${response.statusText}`);
  }
  const result = await response.json();
  return result;
};
