import Image, { type ImageProps } from 'next/image';
import { isFmpStockImageUrl, proxiedStockImageSrc } from '@/lib/stockImageProxy';

export type ExternalStockImageProps = ImageProps & {
  /** FMP 프록시가 1×1 플레이스홀더를 줄 때 등, `onError` 없이도 폴백 처리 */
  onMissing?: () => void;
};

/**
 * FMP `images.financialmodelingprep.com` (symbol|news)는 `/api/stock-image`로 받아
 * upstream 404를 흡수한 뒤 `next/image` 최적화 유지. 그 외 URL은 `unoptimized`.
 */
export function ExternalStockImage({
  alt = '',
  src,
  onLoad,
  onMissing,
  ...props
}: ExternalStockImageProps) {
  const handleLoad: ImageProps['onLoad'] = (e) => {
    onLoad?.(e);
    if (
      onMissing &&
      e.currentTarget.naturalWidth <= 1 &&
      e.currentTarget.naturalHeight <= 1
    ) {
      onMissing();
    }
  };

  if (typeof src !== 'string') {
    return (
      <Image alt={alt} src={src} {...props} onLoad={handleLoad} unoptimized />
    );
  }
  const proxied = proxiedStockImageSrc(src);
  const viaProxy = isFmpStockImageUrl(src);
  return (
    <Image
      alt={alt}
      src={proxied}
      {...props}
      onLoad={handleLoad}
      unoptimized={!viaProxy}
    />
  );
}
