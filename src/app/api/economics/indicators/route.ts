import { getEconomicsIndicators } from '@/services/economics';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (request: NextRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams;
    const name = searchParams.get('name');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    if (!name || !from || !to) {
      return NextResponse.json(
        { error: 'name, from, to are required' },
        { status: 400 },
      );
    }

    const data = await getEconomicsIndicators({
      name,
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
