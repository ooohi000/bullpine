'use client';

import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';

/**
 * 비로그인으로 보호된 회사 하위 경로 진입 시: 안내 모달 후 이전 페이지 또는 목록으로 이동.
 */
const CompanyAuthGateClient = () => {
  const router = useRouter();
  const titleId = useId();
  const descId = useId();
  const confirmRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const id = requestAnimationFrame(() => confirmRef.current?.focus());
    return () => {
      cancelAnimationFrame(id);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const leave = useCallback(() => {
    setOpen(false);
    try {
      const ref = document.referrer;
      if (ref) {
        const refOrigin = new URL(ref).origin;
        if (refOrigin === window.location.origin) {
          router.back();
          return;
        }
      }
    } catch {
      /* ignore */
    }
    router.push('/companies');
  }, [router]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        leave();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, leave]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        aria-label="닫기"
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        onClick={() => setOpen(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="relative z-10 w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-lg"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
            <Lock className="h-5 w-5 text-muted-foreground" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="text-lg font-semibold text-foreground">
              로그인이 필요합니다
            </h2>
            <p
              id={descId}
              className="mt-2 text-sm leading-relaxed text-muted-foreground"
            >
              이 메뉴는 로그인 후 이용할 수 있습니다. 확인을 누르면 이전
              페이지로 돌아갑니다.
            </p>
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            로그인하기
          </Link>
          <button
            ref={confirmRef}
            type="button"
            onClick={() => setOpen(false)}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompanyAuthGateClient;
