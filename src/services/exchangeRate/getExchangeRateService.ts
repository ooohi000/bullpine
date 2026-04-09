import { ExchangeRateResponse } from '@/types';
import { BaseUrl } from '../baseUrl';
import { getBackendJsonRequestHeaders } from '@/lib/server/getBackendRequestHeaders';

export const getExchangeRateService =
  async (): Promise<ExchangeRateResponse> => {
    const url = `${BaseUrl}/api/exchange-rate`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getBackendJsonRequestHeaders(),
      cache: 'no-store',
    });
    if (!response.ok) {
      throw new Error(`API 오류: ${response.statusText}`);
    }
    const result = await response.json();
    return result;
  };
