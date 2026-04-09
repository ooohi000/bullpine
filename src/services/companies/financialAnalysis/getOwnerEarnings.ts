import { OwnerEarningsProps, OwnerEarningsResponse } from '@/types';

export const getOwnerEarnings = async ({
  symbol,
}: OwnerEarningsProps): Promise<OwnerEarningsResponse> => {
  const response = await fetch(`/api/companies/${symbol}/ownerEarnings`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error(`API 오류: ${response.statusText}`);
  }
  const result = await response.json();
  return result;
};
