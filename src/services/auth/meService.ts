import { getBackendJsonRequestHeaders } from '@/lib/server/getBackendRequestHeaders';
import { BaseUrl } from '../baseUrl';
import { MeResponse } from '@/types/auth/me';

export const meService = async (): Promise<MeResponse> => {
  const response = await fetch(`${BaseUrl}/api/auth/me`, {
    method: 'GET',
    headers: getBackendJsonRequestHeaders(),
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error(`API 오류: ${response.statusText}`);
  }
  const result = await response.json();
  return result;
};
