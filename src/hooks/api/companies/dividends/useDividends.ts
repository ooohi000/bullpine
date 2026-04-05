import { getDividends } from '@/services/companies/dividends';
import { DividendsResponse, GetDividendsProps } from '@/types';
import { useQuery } from '@tanstack/react-query';

const useDividends = ({ symbol }: GetDividendsProps) => {
  return useQuery({
    queryKey: ['dividends', symbol],
    queryFn: (): Promise<DividendsResponse> => getDividends({ symbol }),
    staleTime: 6 * 60 * 1000,
    refetchOnMount: false,
  });
};

export default useDividends;
