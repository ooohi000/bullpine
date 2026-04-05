import { getBackendJsonRequestHeaders } from '@/lib/server/getBackendRequestHeaders';
import { BaseUrl } from '../../baseUrl';
import { StockPeerComparisonResponse } from '@/types';

interface GetStockPeerComparisonProps {
  symbol: string;
}
export const getStockPeerComparison = async ({
  symbol,
}: GetStockPeerComparisonProps): Promise<StockPeerComparisonResponse> => {
  const url = `${BaseUrl}/api/profile/stock-peers?symbol=${symbol}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: getBackendJsonRequestHeaders(),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`API 오류: ${response.statusText}`);
  }
  const result = await response.json();
  return result;
};
