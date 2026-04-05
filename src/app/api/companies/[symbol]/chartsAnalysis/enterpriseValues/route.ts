import { getEnterpriseValues } from '@/services/companies/chartsAnalysis/getEnterpriseValues';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (
  request: NextRequest,
  { params }: { params: { symbol: string } },
) => {
  try {
    const resolvedParams = await Promise.resolve(params);
    const { symbol } = resolvedParams;
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit');
    const period = searchParams.get('period');

    if (!symbol || !limit || !period) {
      return NextResponse.json(
        { error: 'symbol, limit, period are required' },
        { status: 400 },
      );
    }

    const limitNumber = parseInt(limit, 10);

    const data = await getEnterpriseValues({
      symbol,
      limit: limitNumber,
      period,
    });

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
};
