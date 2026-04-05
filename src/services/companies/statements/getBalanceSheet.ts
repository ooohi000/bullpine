import type { BalanceSheetResponse, GetBalanceSheetProps } from '@/types';

export const getBalanceSheet = async ({
  symbol,
  limit = 6,
  period = 'FY',
}: GetBalanceSheetProps): Promise<BalanceSheetResponse> => {
  const params = new URLSearchParams();
  params.set('symbol', symbol);
  params.set('limit', limit.toString());
  params.set('period', period);
  const response = await fetch(
    `/api/companies/${symbol}/statements/balanceSheet?${params.toString()}`,
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
