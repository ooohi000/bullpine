import { getFinancialRatios } from '@/services/companies/financialAnalysis/getFinancialRatios';
import { FinancialRatiosResponse, GetFinancialRatiosProps } from '@/types';
import { useQuery } from '@tanstack/react-query';

export const useFinancialRatios = ({
  symbol,
  limit,
  period,
}: GetFinancialRatiosProps) => {
  return useQuery({
    queryKey: ['financialRatios', symbol, limit, period],
    queryFn: (): Promise<FinancialRatiosResponse> =>
      getFinancialRatios({ symbol, limit, period }),
    staleTime: 6 * 60 * 1000,
    refetchOnMount: false,
  });
};
