import { getBackendJsonRequestHeaders } from '@/lib/server/getBackendRequestHeaders';
import { BaseUrl } from '@/services';
import { getIncome } from '@/services/companies/statements/getIncome';
import { PeriodType } from '@/types';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (
  request: NextRequest,
  { params }: { params: { symbol: string } },
) => {
  try {
    const resolvedParams = await Promise.resolve(params);
    const { symbol } = resolvedParams;
    if (!symbol) {
      return NextResponse.json(
        { error: 'symbol 파라미터가 필요합니다.' },
        { status: 400 },
      );
    }

    const backendUrl = new URL(
      `${BaseUrl}/api/statements/income?symbol=${symbol}`,
    );
    request.nextUrl.searchParams.forEach((value, key) => {
      backendUrl.searchParams.set(key, value);
    });

    const res = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers: getBackendJsonRequestHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: res.statusText },
        { status: res.status },
      );
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal Server Error',
      },
      { status: 500 },
    );
  }
};
