import { NewsResponse } from '@/types/news';

interface GetSearchStockNewsFromApiProps {
  symbol: string;
  to: string;
  page: number;
  limit: number;
}

export const getSearchStockNewsFromApi = async ({
  symbol,
  to,
  page,
  limit,
}: GetSearchStockNewsFromApiProps): Promise<NewsResponse> => {
  const response = await fetch(
    `/api/companies/${symbol}/news/searchStockNews?to=${to}&page=${page}&limit=${limit}`,
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
  const result = await response.json();
  return result.data as NewsResponse;
};
