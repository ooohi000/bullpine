import { OwnerEarningsResponse } from '@/types/financialAnalysis';

interface GetOwnerEarningsFromApiProps {
  symbol: string;
  limit?: number;
}

/** 클라이언트 전용. 서버에서는 getOwnerEarnings를 직접 호출하세요. */
export const getOwnerEarningsFromApi = async ({
  symbol,
  limit,
}: GetOwnerEarningsFromApiProps): Promise<OwnerEarningsResponse> => {
  const response = await fetch(
    `/api/companies/${symbol}/financialAnalysis/ownerEarnings?limit=${limit}`,
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
  return data as OwnerEarningsResponse;
};
