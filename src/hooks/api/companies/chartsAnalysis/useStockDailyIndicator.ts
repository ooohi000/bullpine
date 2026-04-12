import { getStockDailyIndicator } from '@/services/companies/chartsAnalysis/getStockDailyIndicatoer';
import {
  StockDailyIndicatorProps,
  StockDailyIndicatorResponse,
} from '@/types/chartsAnalysis/stockDailyIndicator';
import { useQuery } from '@tanstack/react-query';

const useStockDailyIndicator = ({
  symbol,
  from,
  to,
}: StockDailyIndicatorProps) => {
  return useQuery({
    queryKey: ['stockDailyIndicator', symbol, from, to],
    queryFn: (): Promise<StockDailyIndicatorResponse> =>
      getStockDailyIndicator({ symbol, from, to }),
    staleTime: 6 * 60 * 1000,
    refetchOnMount: false,
  });
};

export default useStockDailyIndicator;
