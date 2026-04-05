import { BaseUrl } from '@/services/baseUrl';

export const getFinancialStatementGrowth = async ({
  symbol,
  limit,
  period,
}: {
  symbol: string;
  limit?: number;
  period?: string;
}): Promise<any> => {
  const url = `${BaseUrl}/api/growth/financial?symbol=${symbol}&limit=${limit}&period=${period}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error(`API 오류: ${response.statusText}`);
  }
  const data = await response.json();
  return data;
};
