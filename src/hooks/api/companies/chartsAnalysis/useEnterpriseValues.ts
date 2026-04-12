import { getEnterpriseValues } from '@/services/companies/chartsAnalysis/getEnterpriseValues';
import {
  EnterpriseValuesProps,
  EnterpriseValuesResponse,
} from '@/types/chartsAnalysis/enterpriseValues';
import { useQuery } from '@tanstack/react-query';

const useEnterpriseValues = ({ symbol, from, to }: EnterpriseValuesProps) => {
  return useQuery({
    queryKey: ['enterpriseValues', symbol, from, to],
    queryFn: (): Promise<EnterpriseValuesResponse> =>
      getEnterpriseValues({ symbol, from, to }),
    staleTime: 6 * 60 * 1000,
    refetchOnMount: false,
  });
};

export default useEnterpriseValues;
