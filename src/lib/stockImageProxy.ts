const FMP_IMAGE_ORIGIN = 'https://images.financialmodelingprep.com';

export function isFmpStockImageUrl(url: string): boolean {
  if (!url?.trim()) return false;
  try {
    const u = new URL(url);
    if (u.origin !== FMP_IMAGE_ORIGIN) return false;
    return u.pathname.startsWith('/symbol/') || u.pathname.startsWith('/news/');
  } catch {
    return false;
  }
}

/** FMP만 프록시 → 404는 API에서 플레이스홀더로 흡수, `next/image` 최적화 유지 */
export function proxiedStockImageSrc(url: string): string {
  if (!isFmpStockImageUrl(url)) return url;
  return `/api/stock-image?url=${encodeURIComponent(url)}`;
}
