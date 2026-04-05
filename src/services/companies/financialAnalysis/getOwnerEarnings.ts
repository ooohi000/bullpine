import { BaseUrl } from '@/services/baseUrl';

export const getOwnerEarnings = async ({
  symbol,
  limit,
}: {
  symbol: string;
  limit?: number;
}): Promise<any> => {
  const url = `${BaseUrl}/api/analysis/owner-earnings?symbol=${symbol}&limit=${limit}`;
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
