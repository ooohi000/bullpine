'use client';

import React, { useEffect, useRef, useState } from 'react';
import { User } from 'lucide-react';
import type { MeData } from '@/types/auth/me';
import HeaderLogoutButton from './HeaderLogoutButton';

type HeaderUserDropdownProps = {
  user: MeData | null;
  /** 모바일: 아이콘만 / 데스크톱: 아이콘 + 옆에 짧은 라벨 */
  variant: 'icon' | 'iconWithLabel';
};

const fields: {
  key: keyof Pick<MeData, 'email' | 'nickname' | 'role' | 'tier' | 'status'>;
  label: string;
}[] = [
  { key: 'email', label: '이메일' },
  { key: 'nickname', label: '닉네임' },
  // { key: 'role', label: '역할' },
  { key: 'tier', label: '등급' },
  // { key: 'status', label: '상태' },
];

const HeaderUserDropdown = ({ user, variant }: HeaderUserDropdownProps) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (rootRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={`inline-flex items-center gap-2 rounded-lg p-2.5 text-foreground transition-colors hover:bg-muted/80 hover:text-primary ${
          variant === 'iconWithLabel' ? 'pr-3' : ''
        }`}
        aria-label="내 계정 메뉴"
      >
        <User className="h-6 w-6 shrink-0" aria-hidden />
        {variant === 'iconWithLabel' && user?.nickname ? (
          <span className="max-w-[120px] truncate text-sm font-medium">
            {user.nickname}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          className="absolute right-0 z-[60] mt-2 w-[min(calc(100vw-2rem),18rem)] rounded-xl border border-border bg-card p-4 shadow-lg"
          role="menu"
        >
          {user ? (
            <dl className="space-y-2.5 text-sm">
              {fields.map(({ key, label }) => (
                <div key={key}>
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {label}
                  </dt>
                  <dd className="mt-0.5 break-all text-foreground">
                    {user[key] || '—'}
                  </dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-sm text-muted-foreground">
              회원 정보를 불러오지 못했습니다.
            </p>
          )}

          <div className="mt-4 border-t border-border pt-3">
            <HeaderLogoutButton variant="text" fullWidth />
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default HeaderUserDropdown;
