import Link from 'next/link';
import { Suspense } from 'react';
import { BackToCompanyListLink } from './BackToCompanyListLink';
import { CompanySymbolNotFoundHint } from './CompanySymbolNotFoundHint';

export default function CompanySymbolNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
        404
      </p>
      <h1 className="text-xl font-semibold text-foreground sm:text-2xl">
        종목을 찾을 수 없습니다
      </h1>
      <CompanySymbolNotFoundHint />
      <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
        입력한 티커가 없거나, 아직 서비스에 등록되지 않았을 수 있습니다. 목록에서
        다시 검색해 주세요.
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <Suspense
          fallback={
            <Link
              href="/companies?page=1"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              종목 목록으로
            </Link>
          }
        >
          <BackToCompanyListLink />
        </Suspense>
        <Link
          href="/"
          className="inline-flex h-10 items-center justify-center rounded-lg border border-border px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          홈으로
        </Link>
      </div>
    </div>
  );
}
