import { IncomeResponse } from '@/types/statements';

export const getIncomeFromApi = async ({
  symbol,
  limit = 6,
  period = 'annual',
  baseUrl,
}: {
  symbol: string;
  limit?: number;
  period?: string;
  baseUrl: string;
}): Promise<IncomeResponse> => {
  const response = await fetch(
    `${baseUrl}/api/companies/${symbol}/statements/income?period=${period}&limit=${limit}`,
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
  const data = await response.json();
  return data as IncomeResponse;
};
