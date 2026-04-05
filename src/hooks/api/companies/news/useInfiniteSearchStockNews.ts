import { useInfiniteQuery } from '@tanstack/react-query';
import { getSearchStockNewsFromApi } from '@/services/companies/news/getSearchStockNewsFromApi';
import { NewsResponse } from '@/types/news';

function getItems(response: NewsResponse): unknown[] {
  if (Array.isArray(response)) return response;
  if (response && typeof response === 'object') {
    if (Array.isArray(response.content)) return response.content;
    if (Array.isArray(response.data)) return response.data;
  }
  return [];
}

interface UseInfiniteSearchStockNewsProps {
  symbol: string;
  to: string;
  limit: number;
}

const useInfiniteSearchStockNews = ({
  symbol,
  to,
  limit = 10,
}: UseInfiniteSearchStockNewsProps) => {
  return useInfiniteQuery({
    queryKey: ['searchStockNews', 'infinite', symbol, to, limit],
    queryFn: async ({ pageParam = 0 }) => {
      return getSearchStockNewsFromApi({ symbol, to, page: pageParam, limit });
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const items = getItems(lastPage);
      if (items.length < limit) return undefined;
      return allPages.length;
    },
    staleTime: 2 * 60 * 1000,
  });
};

export default useInfiniteSearchStockNews;
