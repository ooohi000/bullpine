import { useInfiniteQuery } from '@tanstack/react-query';
import {
  InfinitePressReleasesParams,
  PressReleasesResponse,
} from '@/types';
import { getSearchPressReleases } from '@/services/companies/news';

const useInfiniteSearchPressReleases = ({
  symbol,
  limit,
  to,
}: InfinitePressReleasesParams) => {
  return useInfiniteQuery({
    queryKey: ['searchPressReleases', 'infinite', symbol, limit, to ?? ''],
    queryFn: async ({ pageParam = 0 }) => {
      return getSearchPressReleases({
        symbol,
        page: pageParam as number,
        limit,
        to,
      });
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage: PressReleasesResponse, allPages) => {
      const slice = lastPage?.data?.content;
      if (!slice?.length) return undefined;
      if (lastPage.data.last) return undefined;
      return allPages.length;
    },
    staleTime: 2 * 60 * 1000,
  });
};

export default useInfiniteSearchPressReleases;
