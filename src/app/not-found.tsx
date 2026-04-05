import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
        404
      </p>
      <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
        페이지를 찾을 수 없습니다
      </h1>
      <p className="max-w-md text-sm text-muted-foreground leading-relaxed">
        주소가 잘못되었거나 삭제된 페이지입니다. 홈으로 돌아가거나 이전
        화면에서 다시 시도해 주세요.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          홈으로
        </Link>
        <Link
          href="/companies"
          className="inline-flex h-10 items-center justify-center rounded-lg border border-border px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          종목 목록
        </Link>
      </div>
    </div>
  );
}
