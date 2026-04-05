import { getOwnerEarnings } from '@/services/companies/financialAnalysis';
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

    if (!symbol || !limit) {
      return NextResponse.json(
        { error: 'symbol, limit are required' },
        { status: 400 },
      );
    }

    const limitNumber = parseInt(limit, 10);

    const data = await getOwnerEarnings({
      symbol,
      limit: limitNumber,
    });
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
};
