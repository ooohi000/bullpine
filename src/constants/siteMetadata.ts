import type { Metadata } from 'next';

export const SITE_NAME = 'Bullpine';

/** 검색·SNS 미리보기용 짧은 설명 (권장 150자 내외) */
export const SITE_DESCRIPTION =
  '기업 재무제표, 재무 비율, 실적·배당, 뉴스까지 한곳에서 보는 주식·기업 정보 서비스.';

/**
 * OG·canonical 절대 URL 기준. 배포 시 `NEXT_PUBLIC_SITE_URL` 권장 (예: https://bullpine.com)
 * Vercel은 `VERCEL_URL`로 fallback.
 */
export function getMetadataBase(): URL {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) {
    try {
      return new URL(explicit.endsWith('/') ? explicit.slice(0, -1) : explicit);
    } catch {
      /* ignore */
    }
  }
  if (process.env.VERCEL_URL) {
    return new URL(`https://${process.env.VERCEL_URL}`);
  }
  return new URL('http://localhost:3000');
}

export const defaultSiteMetadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    'Bullpine',
    '불파인',
    '주식',
    '종목',
    '기업 분석',
    '재무제표',
    '손익계산서',
    '대차대조표',
    '현금흐름표',
    '재무비율',
    '실적',
    '배당',
    '티커',
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    // 배포 후 `app/opengraph-image.png` 등 추가 시 자동 연동 가능
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};
