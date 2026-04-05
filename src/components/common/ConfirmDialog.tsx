'use client';

import React, { useEffect, useId, useRef } from 'react';

export type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 제목 없으면 본문만 표시 */
  title?: string;
  description: string;
  confirmLabel?: string;
  /** 확인 버튼·백드롭·Esc — 호출 후 `onOpenChange(false)` */
  onConfirm?: () => void;
  /** 배경 클릭 시 닫기 (기본 true, `onConfirm`도 호출) */
  closeOnBackdrop?: boolean;
  /** Esc 시 닫기 (기본 true) */
  closeOnEscape?: boolean;
};

/**
 * 공통 단일 확인 팝업 (알림/성공 안내용). 확인·백드롭·Esc 동작은 props로 조절.
 */
const ConfirmDialog = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = '확인',
  onConfirm,
  closeOnBackdrop = true,
  closeOnEscape = true,
}: ConfirmDialogProps) => {
  const titleId = useId();
  const descId = useId();
  const confirmRef = useRef<HTMLButtonElement>(null);

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

  useEffect(() => {
    if (!open || !closeOnEscape) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onConfirm?.();
        onOpenChange(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, closeOnEscape, onConfirm, onOpenChange]);

  if (!open) return null;

  const handleConfirm = () => {
    onConfirm?.();
    onOpenChange(false);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        aria-label="닫기"
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        onClick={() => {
          if (closeOnBackdrop) handleConfirm();
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={descId}
        className="relative z-10 w-full max-w-sm rounded-xl border border-white/10 bg-card p-5 shadow-lg"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {title ? (
          <h2
            id={titleId}
            className="text-lg font-semibold text-foreground"
          >
            {title}
          </h2>
        ) : null}
        <p
          id={descId}
          className={`text-sm text-muted-foreground ${title ? 'mt-2' : ''}`}
        >
          {description}
        </p>
        <div className="mt-5 flex justify-end">
          <button
            ref={confirmRef}
            type="button"
            onClick={handleConfirm}
            className="rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-destructive/90"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
