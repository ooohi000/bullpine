import { BaseUrl } from '@/services/baseUrl';
import { NewsResponse } from '@/types/news';

export const getSearchStockNews = async ({
  symbol,
  to,
  page,
  limit,
}: {
  symbol: string;
  to: string;
  page: number;
  limit: number;
}): Promise<NewsResponse> => {
  const url = `${BaseUrl}/api/news/search-stock?symbol=${symbol}&to=${to}&page=${page}&limit=${limit}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });
  if (!response.ok) {
    const statusText = response.statusText || `${response.status}`;
    throw new Error(`API 오류: ${response.status} ${statusText}`);
  }
  const data = await response.json();
  return data as NewsResponse;
};
