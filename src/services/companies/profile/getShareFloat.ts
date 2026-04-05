import { SharesFloatResponse } from '@/types';
import { BaseUrl } from '../../baseUrl';
import { getBackendJsonRequestHeaders } from '@/lib/server/getBackendRequestHeaders';

export const getShareFloat = async ({
  symbol,
}: {
  symbol: string;
}): Promise<SharesFloatResponse> => {
  const url = `${BaseUrl}/api/shares-float?symbol=${symbol}`;
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

export default getShareFloat;
