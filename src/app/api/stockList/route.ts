import { AUTH_ACCESS_TOKEN_COOKIE } from '@/constants/authCookies';
import { getBackendJsonRequestHeaders } from '@/lib/server/getBackendRequestHeaders';
import { BaseUrl } from '@/services';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

/**
 * 클라이언트는 BASE_URL을 볼 수 없으므로, 서버에서만 업스트림으로 프록시.
 * 여기서 @/services의 getStockList를 부르면 안 됨 — 그 함수는 다시 /api/stockList를 호출해 순환됨.
 */
export const GET = async (request: NextRequest) => {
  try {
    const backendUrl = new URL(`${BaseUrl}/api/stockList`);
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
