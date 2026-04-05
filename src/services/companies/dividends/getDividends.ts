import { BaseUrl } from '@/services/baseUrl';
import { DividendsResponse, GetDividendsProps } from '@/types';

export const getDividends = async ({
  symbol,
}: GetDividendsProps): Promise<DividendsResponse> => {
  const params = new URLSearchParams();
  params.set('symbol', symbol);
  const response = await fetch(
    `/api/companies/${symbol}/dividends?${params.toString()}`,
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
  const result = await response.json();
  return result;
};
