import { TreasuryRatesResponse } from '@/types/economics/treasuryRates';

interface GetTreasuryRatesFromApiProps {
  from: string;
  to: string;
}
export const getTreasuryRatesFromApi = async ({
  from,
  to,
}: GetTreasuryRatesFromApiProps): Promise<TreasuryRatesResponse> => {
  const response = await fetch(
    `/api/economics/treasury-rates?from=${from}&to=${to}`,
  );
  if (!response.ok) {
    throw new Error(`API 오류: ${response.statusText}`);
  }
  const data = await response.json();
  return data as TreasuryRatesResponse;
};
