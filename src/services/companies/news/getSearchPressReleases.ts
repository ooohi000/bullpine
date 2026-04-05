import { GetPressReleasesProps, PressReleasesResponse } from '@/types';

export const getSearchPressReleases = async ({
  symbol,
  page,
  limit,
  to,
}: GetPressReleasesProps): Promise<PressReleasesResponse> => {
  const params = new URLSearchParams();
  params.set('symbol', symbol);
  params.set('page', String(page));
  params.set('limit', String(limit));
  if (to) params.set('to', to);
  const response = await fetch(
    `/api/companies/${symbol}/news/searchPressReleases?${params.toString()}`,
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
  return response.json() as Promise<PressReleasesResponse>;
};
