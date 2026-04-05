import { useQuery } from '@tanstack/react-query';
import { IncomeResponse, PeriodType } from '@/types';
import { getIncome } from '@/services/companies/statements/getIncome';

interface UseIncomeProps {
  period: PeriodType;
  symbol: string;
  limit: number;
}

const useIncome = ({ period, symbol, limit }: UseIncomeProps) => {
  return useQuery({
    queryKey: ['income', period, symbol, limit],
    queryFn: (): Promise<IncomeResponse> =>
      getIncome({
        symbol,
        period,
        limit,
      }),
    staleTime: 6 * 60 * 1000,
    refetchOnMount: false,
  });
};

export default useIncome;
