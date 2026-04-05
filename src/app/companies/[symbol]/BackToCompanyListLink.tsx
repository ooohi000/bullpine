'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export function BackToCompanyListLink() {
  const sp = useSearchParams();
  const page = sp.get('page');
  const search = sp.get('search');
  const qs = new URLSearchParams();
  qs.set('page', page && page !== '' ? page : '1');
  if (search) qs.set('search', search);

  return (
    <Link
      href={`/companies?${qs.toString()}`}
      className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
    >
      종목 목록으로
    </Link>
  );
}
