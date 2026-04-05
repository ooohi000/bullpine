'use client';

import React from 'react';
import { useFormStatus } from 'react-dom';
import { LogOut, Loader2 } from 'lucide-react';
import { logoutAction } from '@/actions/logout';

type HeaderLogoutButtonProps = {
  /** 모바일: 아이콘만 / 데스크톱: 텍스트 버튼 */
  variant: 'icon' | 'text';
  /** 드롭다운 등에서 가로 전체 너비 */
  fullWidth?: boolean;
};

function IconSubmit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex rounded-lg p-2.5 text-foreground hover:text-primary transition-colors disabled:opacity-50"
      aria-label="로그아웃"
    >
      {pending ? (
        <Loader2 className="h-6 w-6 shrink-0 animate-spin" aria-hidden />
      ) : (
        <LogOut className="h-6 w-6 shrink-0" aria-hidden />
      )}
    </button>
  );
}

function TextSubmit({ fullWidth }: { fullWidth?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-destructive disabled:opacity-50 ${
        fullWidth ? 'w-full justify-center' : ''
      }`}
    >
      {pending ? '로그아웃 중…' : '로그아웃'}
    </button>
  );
}

const HeaderLogoutButton = ({
  variant,
  fullWidth,
}: HeaderLogoutButtonProps) => {
  return (
    <form
      action={logoutAction}
      className={fullWidth ? 'flex w-full' : 'inline-flex'}
    >
      {variant === 'icon' ? (
        <IconSubmit />
      ) : (
        <TextSubmit fullWidth={fullWidth} />
      )}
    </form>
  );
};

export default HeaderLogoutButton;
