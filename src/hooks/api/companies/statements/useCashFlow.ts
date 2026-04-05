import { useQuery } from '@tanstack/react-query';
import { CashFlowResponse, PeriodType } from '@/types';
import { getCashFlow } from '@/services/companies/statements/getCashFlow';

interface UseCashFlowProps {
  period: PeriodType;
  symbol: string;
  limit: number;
}

const useCashFlow = ({ period, symbol, limit }: UseCashFlowProps) => {
  return useQuery({
    queryKey: ['cashFlow', period, symbol, limit],
    queryFn: (): Promise<CashFlowResponse> =>
      getCashFlow({
        symbol,
        period,
        limit,
      }),
    staleTime: 6 * 60 * 1000,
    refetchOnMount: false,
  });
};

export default useCashFlow;
