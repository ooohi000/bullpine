import { getStockPriceAndVolume } from '@/services/companies/chartsAnalysis';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (
  request: NextRequest,
  { params }: { params: { symbol: string } },
) => {
  try {
    const resolvedParams = await Promise.resolve(params);
    const { symbol } = resolvedParams;
    const searchParams = request.nextUrl.searchParams;
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    if (!symbol || !from || !to) {
      return NextResponse.json(
        { error: 'symbol, from, to are required' },
        { status: 400 },
      );
    }

    const data = await getStockPriceAndVolume({
      symbol,
      from,
      to,
    });
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
};
