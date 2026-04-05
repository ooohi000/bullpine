import { getKeyMetrics } from '@/services/companies/financialAnalysis/getKeyMetrics';
import { GetKeyMetricsProps, KeyMetricsResponse } from '@/types';
import { useQuery } from '@tanstack/react-query';

const useKeyMetrics = ({ symbol, limit, period }: GetKeyMetricsProps) => {
  return useQuery({
    queryKey: ['keyMetrics', symbol, limit, period],
    queryFn: (): Promise<KeyMetricsResponse> =>
      getKeyMetrics({ symbol, limit, period }),
    staleTime: 6 * 60 * 1000,
    refetchOnMount: false,
  });
};

export default useKeyMetrics;
