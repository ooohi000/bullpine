import { BaseUrl } from '@/services/baseUrl';

export const getTreasuryRates = async ({
  from,
  to,
}: {
  from: string;
  to: string;
}): Promise<any> => {
  const url = `${BaseUrl}/api/economics/treasury-rates?from=${from}&to=${to}`;
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
