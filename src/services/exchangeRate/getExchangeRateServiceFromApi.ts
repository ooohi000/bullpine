import { ExchangeRateResponse } from '@/types/exchangeRate/exchangeRate';

export const getExchangeRateServiceFromApi = async ({
  baseUrl,
}: {
  baseUrl: string;
}): Promise<ExchangeRateResponse> => {
  const response = await fetch(`${baseUrl}/api/exchangeRate`, {
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
  return data.data as ExchangeRateResponse;
};

export default getExchangeRateServiceFromApi;
