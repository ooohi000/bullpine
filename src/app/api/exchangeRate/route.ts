import { getExchangeRateService } from '@/services/exchangeRate/getExchangeRateService';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async () => {
  try {
    const data = await getExchangeRateService();
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
};
