import { RevenueProductSegmentationResponse } from '@/types';
import { BaseUrl } from '../../baseUrl';
import { getBackendJsonRequestHeaders } from '@/lib/server/getBackendRequestHeaders';

export const getRevenueProductSegmentation = async ({
  symbol,
  period,
}: {
  symbol: string;
  period: string;
}): Promise<RevenueProductSegmentationResponse> => {
  const url = `${BaseUrl}/api/segmentation/revenue-product?symbol=${symbol}&period=${period}`;
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
