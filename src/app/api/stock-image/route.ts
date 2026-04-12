import { isFmpStockImageUrl } from '@/lib/stockImageProxy';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

/** 1×1 투명 PNG (upstream 404 시에도 200으로 응답) */
const PLACEHOLDER_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get('url');
  if (!raw || !isFmpStockImageUrl(raw)) {
    return NextResponse.json({ error: 'Invalid or disallowed url' }, { status: 400 });
  }

  try {
    const upstream = await fetch(raw, {
      next: { revalidate: 86_400 },
      signal: AbortSignal.timeout(12_000),
    });

    if (!upstream.ok) {
      return new NextResponse(PLACEHOLDER_PNG, {
        status: 200,
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=300, s-maxage=300',
        },
      });
    }

    const buf = Buffer.from(await upstream.arrayBuffer());
    const contentType =
      upstream.headers.get('content-type')?.split(';')[0]?.trim() ||
      'image/png';

    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  } catch {
    return new NextResponse(PLACEHOLDER_PNG, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=60, s-maxage=60',
      },
    });
  }
}
