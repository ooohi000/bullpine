import { NewsResponse } from '@/types/news';

interface GetSearchPressReleasesFromApiProps {
  symbol: string;
  to: string;
  page: number;
  limit: number;
}

export const getSearchPressReleasesFromApi = async ({
  symbol,
  to,
  page,
  limit,
}: GetSearchPressReleasesFromApiProps): Promise<NewsResponse> => {
  const response = await fetch(
    `/api/companies/${symbol}/news/searchPressReleases?to=${to}&page=${page}&limit=${limit}`,
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
