import { getBackendJsonRequestHeaders } from '@/lib/server/getBackendRequestHeaders';
import { GetStockListResponse } from '@/types';
import { cookies } from 'next/headers';

export const getStockList = async ({
  page,
  limit,
  search = '',
  exchange = '',
  sector = '',
  industry = '',
  country = '',
}: {
  page: number;
  limit: number;
  search: string;
  exchange?: string;
  sector?: string;
  industry?: string;
  country?: string;
}) => {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', String(limit));
  if (search) params.set('search', search);
  if (exchange) params.set('exchange', exchange);
  if (sector) params.set('sector', sector);
  if (industry) params.set('industry', industry);
  if (country) params.set('country', country);
  const response = await fetch(`/api/stockList?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error(`API 오류: ${response.statusText}`);
  }
  const result: GetStockListResponse = await response.json();
  return result.data;
};
