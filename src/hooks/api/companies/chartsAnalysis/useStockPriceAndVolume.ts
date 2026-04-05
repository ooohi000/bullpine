import { getStockPriceAndVolumeFromApi } from '@/services/companies/chartsAnalysis/getStockPriceAndVolumeFromApi';
import { StockPriceAndVolumeResponse } from '@/types/chartsAnalysis';
import { useQuery } from '@tanstack/react-query';

interface UseStockPriceAndVolumeProps {
  symbol: string;
  from: string;
  to: string;
}

const useStockPriceAndVolume = ({
  symbol,
  from,
  to,
}: UseStockPriceAndVolumeProps) => {
  return useQuery({
    queryKey: ['stockPriceAndVolume', symbol, from, to],
    queryFn: (): Promise<StockPriceAndVolumeResponse> =>
      getStockPriceAndVolumeFromApi({ symbol, from, to }),
    staleTime: 6 * 60 * 1000,
    refetchOnMount: false,
  });
};

export default useStockPriceAndVolume;
