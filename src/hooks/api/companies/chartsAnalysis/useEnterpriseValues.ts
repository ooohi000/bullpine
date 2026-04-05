import { getEnterpriseValuesFromApi } from '@/services/companies/chartsAnalysis/getEnterpriseValuesFromApi';
import { EnterpriseValuesResponse } from '@/types/chartsAnalysis/enterpriseValues';
import { useQuery } from '@tanstack/react-query';

interface UseEnterpriseValuesProps {
  symbol: string;
  limit: number;
  period: string;
}

const useEnterpriseValues = ({
  symbol,
  limit,
  period,
}: UseEnterpriseValuesProps) => {
  return useQuery({
    queryKey: ['enterpriseValues', symbol, limit, period],
    queryFn: (): Promise<EnterpriseValuesResponse> =>
      getEnterpriseValuesFromApi({ symbol, limit, period }),
    staleTime: 6 * 60 * 1000,
    refetchOnMount: false,
  });
};

export default useEnterpriseValues;
