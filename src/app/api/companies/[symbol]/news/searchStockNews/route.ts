import { getSearchStockNews } from '@/services/companies/news';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> },
) => {
  try {
    const resolvedParams = await Promise.resolve(params);
    const { symbol } = resolvedParams;
    const searchParams = request.nextUrl.searchParams;
    const to = searchParams.get('to');
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');

    if (!symbol || !to || !page || !limit) {
      return NextResponse.json(
        { error: 'symbol, to, page, limit are required' },
        { status: 400 },
      );
    }

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    const data = await getSearchStockNews({
      symbol,
      to,
      page: pageNumber,
      limit: limitNumber,
    });

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal Server Error',
      },
      { status: 500 },
    );
  }
};
