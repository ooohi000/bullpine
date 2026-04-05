import { getBackendJsonRequestHeaders } from '@/lib/server/getBackendRequestHeaders';
import { BaseUrl } from '@/services/baseUrl';
import { ExecutivesResponse } from '@/types';

interface GetExecutivesProps {
  symbol: string;
  active: boolean;
}

export const getExecutives = async ({
  symbol,
  active,
}: GetExecutivesProps): Promise<ExecutivesResponse> => {
  const url = `${BaseUrl}/api/executives?symbol=${symbol}&active=${active}`;
  const response = await fetch(url, {
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
