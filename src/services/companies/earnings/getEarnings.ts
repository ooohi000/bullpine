import { EarningsResponse, GetEarningsProps } from '@/types';

export const getEarnings = async ({
  symbol,
}: GetEarningsProps): Promise<EarningsResponse> => {
  const params = new URLSearchParams();
  params.set('symbol', symbol);
  const response = await fetch(
    `/api/companies/${symbol}/earnings?${params.toString()}`,
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
