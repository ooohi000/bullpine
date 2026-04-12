import { StockPriceAndVolumeProps, StockPriceAndVolumeResponse } from '@/types';

export const getStockPriceAndVolume = async ({
  symbol,
  from,
  to,
}: StockPriceAndVolumeProps): Promise<StockPriceAndVolumeResponse> => {
  const params = new URLSearchParams();
  params.set('symbol', symbol);
  from ? params.set('from', from) : '';
  to ? params.set('to', to) : '';
  const response = await fetch(
    `/api/companies/${symbol}/chartsAnalysis/stockPriceAndVolume?${params.toString()}`,
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
  return data;
};
