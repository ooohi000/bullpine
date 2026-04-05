import { StockPriceAndVolumeResponse } from '@/types/chartsAnalysis';

interface GetStockPriceAndVolumeFromApiProps {
  symbol: string;
  from: string;
  to: string;
}
export const getStockPriceAndVolumeFromApi = async ({
  symbol,
  from,
  to,
}: GetStockPriceAndVolumeFromApiProps): Promise<StockPriceAndVolumeResponse> => {
  const response = await fetch(
    `/api/companies/${symbol}/chartsAnalysis/stockPriceAndVolume?from=${from}&to=${to}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    },
  );
  if (!response.ok) {
    throw new Error(`API 오류: ${response.statusText}`);
  }
  const data = await response.json();
  return data as StockPriceAndVolumeResponse;
};
