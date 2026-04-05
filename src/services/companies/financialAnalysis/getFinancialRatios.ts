import { FinancialRatiosResponse, GetFinancialRatiosProps } from '@/types';

export const getFinancialRatios = async ({
  symbol,
  limit = 6,
  period = 'FY',
}: GetFinancialRatiosProps): Promise<FinancialRatiosResponse> => {
  const params = new URLSearchParams();
  params.set('symbol', symbol);
  params.set('limit', limit.toString());
  params.set('period', period);
  const response = await fetch(
    `/api/companies/${symbol}/financialAnalysis/financial?${params.toString()}`,
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
