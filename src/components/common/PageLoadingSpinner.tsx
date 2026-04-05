import React from 'react';

type PageLoadingSpinnerProps = {
  className?: string;
};

/**
 * 라우트 `loading.tsx`·Suspense fallback용 전역 스피너.
 */
const PageLoadingSpinner = ({ className = '' }: PageLoadingSpinnerProps) => {
  return (
    <div
      className={`flex min-h-[min(50vh,360px)] w-full flex-col items-center justify-center gap-3 px-4 py-16 ${className}`}
      role="status"
      aria-live="polite"
      aria-label="페이지를 불러오는 중입니다"
    >
      <div
        className="h-9 w-9 animate-spin rounded-full border-2 border-muted-foreground/25 border-t-primary"
        aria-hidden
      />
      <p className="text-sm text-muted-foreground">불러오는 중…</p>
    </div>
  );
};

export default PageLoadingSpinner;
