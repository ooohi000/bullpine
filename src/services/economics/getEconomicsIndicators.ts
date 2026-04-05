import { BaseUrl } from '@/services/baseUrl';

export const getEconomicsIndicators = async ({
  name,
  from,
  to,
}: {
  name: string;
  from: string;
  to: string;
  limit?: number;
}): Promise<any> => {
  const url = `${BaseUrl}/api/economics/indicators?name=${name}&from=${from}&to=${to}`;
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
