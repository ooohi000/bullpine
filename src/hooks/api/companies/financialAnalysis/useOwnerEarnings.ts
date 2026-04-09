import { getOwnerEarnings } from '@/services/companies/financialAnalysis';
import { OwnerEarningsProps, OwnerEarningsResponse } from '@/types';
import { useQuery } from '@tanstack/react-query';

const useOwnerEarnings = ({ symbol }: OwnerEarningsProps) => {
  return useQuery({
    queryKey: ['ownerEarnings', symbol],
    queryFn: (): Promise<OwnerEarningsResponse> => getOwnerEarnings({ symbol }),
    staleTime: 6 * 60 * 1000,
    refetchOnMount: false,
  });
};

export default useOwnerEarnings;
