import { getBackendJsonRequestHeaders } from '@/lib/server/getBackendRequestHeaders';
import { BaseUrl } from '@/services/baseUrl';
import { CompanyProfileResponse } from '@/types';

export const getCompanyProfile = async ({
  symbol,
}: {
  symbol: string;
}): Promise<CompanyProfileResponse> => {
  const response = await fetch(`${BaseUrl}/api/profile?symbol=${symbol}`, {
    method: 'GET',
    headers: getBackendJsonRequestHeaders(),
    cache: 'no-store',
  });
  if (!response.ok) {
    /** 존재하지 않는 심볼 등 — 레이아웃에서 notFound()로 처리할 수 있게 throw 하지 않음 */
    if (response.status === 404 || response.status === 400) {
      return { success: false, data: [] as CompanyProfileResponse['data'] };
    }
    throw new Error(`API 오류: ${response.statusText}`);
  }
  const result = (await response.json()) as CompanyProfileResponse;
  return result;
};
