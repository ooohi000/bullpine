import { BaseUrl } from '@/services/baseUrl';

export const getStockPriceAndVolume = async ({
  symbol,
  from,
  to,
}: {
  symbol: string;
  from: string;
  to: string;
}): Promise<any> => {
  const url = `${BaseUrl}/api/charts/stock-price-volume?symbol=${symbol}&from=${from}&to=${to}`;
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
