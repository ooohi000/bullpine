import { useQuery } from '@tanstack/react-query';
import { BalanceSheetResponse, GetBalanceSheetProps } from '@/types';
import { getBalanceSheet } from '@/services/companies/statements/getBalanceSheet';

const useBalanceSheet = ({ period, symbol, limit }: GetBalanceSheetProps) => {
  return useQuery({
    queryKey: ['balanceSheet', period, symbol, limit],
    queryFn: (): Promise<BalanceSheetResponse> =>
      getBalanceSheet({
        symbol,
        period,
        limit,
      }),
    staleTime: 6 * 60 * 1000,
    refetchOnMount: false,
  });
};

export default useBalanceSheet;
