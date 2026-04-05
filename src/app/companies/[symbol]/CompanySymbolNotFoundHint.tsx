'use client';

import { usePathname } from 'next/navigation';

/** URL 경로에서 종목 코드만 보여 줌 (not-found 전용) */
export function CompanySymbolNotFoundHint() {
  const pathname = usePathname();
  const segments = pathname?.split('/').filter(Boolean) ?? [];
  const code =
    segments[0] === 'companies' && segments[1] ? segments[1] : null;
  if (!code) return null;
  const display = decodeURIComponent(code).toUpperCase();
  return (
    <p className="text-sm text-muted-foreground">
      요청한 코드:{' '}
      <span className="font-mono font-medium text-foreground">{display}</span>
    </p>
  );
}
