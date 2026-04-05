import { getStockList } from '@/services';
import { GetStockListData } from '@/types';
import { useQuery } from '@tanstack/react-query';

interface UseStockListProps {
  search: string;
  page: number;
  limit: number;
  exchange?: string;
  sector?: string;
  industry?: string;
  country?: string;
}

const useStockList = ({
  search,
  page,
  limit,
  exchange = '',
  sector = '',
  industry = '',
  country = '',
}: UseStockListProps) => {
  return useQuery({
    queryKey: ['stockList', page, limit, exchange, sector, industry, country],
    queryFn: (): Promise<GetStockListData> =>
      getStockList({
        page,
        limit,
        search,
        exchange,
        sector,
        industry,
        country,
      }),
    staleTime: 6 * 60 * 1000,
    refetchOnMount: false,
  });
};

export default useStockList;
