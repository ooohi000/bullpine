import getShareFloat from '@/services/companies/profile/getShareFloat';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> | { symbol: string } }
) => {
  try {
    const resolvedParams = await Promise.resolve(params);
    let symbol = resolvedParams?.symbol;

    if (!symbol) {
      return NextResponse.json(
        { error: 'symbol 파라미터가 필요합니다.' },
        { status: 400 }
      );
    }

    const data = await getShareFloat({ symbol });
    return NextResponse.json({ data });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
};
