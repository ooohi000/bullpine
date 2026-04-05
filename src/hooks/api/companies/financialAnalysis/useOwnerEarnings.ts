import { getOwnerEarningsFromApi } from '@/services/companies/financialAnalysis/getOwnerEarningsFromApi';
import { OwnerEarningsResponse } from '@/types/financialAnalysis';
import { useQuery } from '@tanstack/react-query';

interface UseOwnerEarningsProps {
  symbol: string;
  limit: number;
}

const useOwnerEarnings = ({ symbol, limit }: UseOwnerEarningsProps) => {
  return useQuery({
    queryKey: ['ownerEarnings', symbol, limit],
    queryFn: (): Promise<OwnerEarningsResponse> =>
      getOwnerEarningsFromApi({ symbol, limit }),
    staleTime: 6 * 60 * 1000,
    refetchOnMount: false,
  });
};

export default useOwnerEarnings;
