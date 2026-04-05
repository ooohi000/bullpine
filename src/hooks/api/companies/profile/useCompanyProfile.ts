import { useQuery } from '@tanstack/react-query';
import type { CompanyProfile } from '@/types/profile';

interface UseCompanyProfileProps {
  symbol: string;
}

export default function useCompanyProfile({ symbol }: UseCompanyProfileProps) {
  return useQuery({
    queryKey: ['companyProfile', symbol],
    queryFn: async () => {
      const response = await fetch(
        `/api/companies/${symbol}/profile/companyProfile`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        },
      );
      if (!response.ok) {
        throw new Error('프로필을 가져오는데 실패했습니다');
      }
      const result = await response.json();
      const list = result.data as CompanyProfile[] | undefined;
      return list?.[0] ?? null;
    },
    staleTime: 10 * 60 * 1000,
    refetchOnMount: false,
  });
}
