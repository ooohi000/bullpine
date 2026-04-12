import {
  StockDailyIndicatorProps,
  StockDailyIndicatorResponse,
} from '@/types/chartsAnalysis/stockDailyIndicator';

export const getStockDailyIndicator = async ({
  symbol,
  from,
  to,
}: StockDailyIndicatorProps): Promise<StockDailyIndicatorResponse> => {
  const params = new URLSearchParams();
  params.set('symbol', symbol);
  from ? params.set('from', from) : '';
  to ? params.set('to', to) : '';
  const response = await fetch(
    `/api/companies/${symbol}/chartsAnalysis/stockDailyIndicator?${params.toString()}`,
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
