import { getBackendJsonRequestHeaders } from '@/lib/server/getBackendRequestHeaders';
import { BaseUrl } from '../../baseUrl';
import { CompanyEmployeeCountResponse } from '@/types';

export const getCompanyEmployeeCount = async ({
  symbol,
  limit,
}: {
  symbol: string;
  limit?: number;
}): Promise<CompanyEmployeeCountResponse> => {
  const url = `${BaseUrl}/api/profile/company-employee-count?symbol=${symbol}&limit=${limit}`;
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
