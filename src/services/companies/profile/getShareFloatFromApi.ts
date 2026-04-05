import { SharesFloatResponse } from '@/types/profile/sharesFloat';

export const getShareFloatFromApi = async ({
  symbol,
  baseUrl,
}: {
  symbol: string;
  baseUrl: string;
}): Promise<SharesFloatResponse> => {
  const response = await fetch(
    `${baseUrl}/api/companies/${symbol}/profile/sharesFloat`,
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
  return data as SharesFloatResponse;
};
