'use client';

import React, { useEffect, useId, useRef } from 'react';
import Link from 'next/link';
import { Lock } from 'lucide-react';

export type LoginRequiredModalProps = {
  open: boolean;
  onClose: () => void;
};

/**
 * 비로그인 사용자가 보호 메뉴 등을 눌렀을 때 — URL 변경 없이 안내만 표시.
 */
const LoginRequiredModal = ({ open, onClose }: LoginRequiredModalProps) => {
  const titleId = useId();
  const descId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const id = requestAnimationFrame(() => closeRef.current?.focus());
    return () => {
      cancelAnimationFrame(id);
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

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
        onClick={onClose}
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
            <h2
              id={titleId}
              className="text-lg font-semibold text-foreground"
            >
              로그인이 필요합니다
            </h2>
            <p
              id={descId}
              className="mt-2 text-sm leading-relaxed text-muted-foreground"
            >
              이 메뉴는 로그인 후 이용할 수 있습니다. 로그인한 뒤 다시 시도해
              주세요.
            </p>
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            닫기
          </button>
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            로그인하기
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginRequiredModal;
