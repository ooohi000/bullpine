import { EnterpriseValuesResponse } from '@/types/chartsAnalysis/enterpriseValues';

interface GetEnterpriseValuesFromApiProps {
  symbol: string;
  limit?: number;
  period?: string;
}

/** 클라이언트 전용. 서버에서는 getEnterpriseValues를 직접 호출하세요. */
export const getEnterpriseValuesFromApi = async ({
  symbol,
  limit,
  period,
}: GetEnterpriseValuesFromApiProps): Promise<EnterpriseValuesResponse> => {
  const response = await fetch(
    `/api/companies/${symbol}/chartsAnalysis/enterpriseValues?period=${period}&limit=${limit}`,
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
  return data as EnterpriseValuesResponse;
};
