import { getEarnings } from '@/services/companies/earnings';
import { EarningsResponse, GetEarningsProps } from '@/types/earnings/earnings';
import { useQuery } from '@tanstack/react-query';

const useEarnings = ({ symbol }: GetEarningsProps) => {
  return useQuery({
    queryKey: ['earnings', symbol],
    queryFn: (): Promise<EarningsResponse> => getEarnings({ symbol }),
    staleTime: 6 * 60 * 1000,
    refetchOnMount: false,
  });
};

export default useEarnings;
