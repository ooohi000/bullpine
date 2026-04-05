import React from 'react';
import type { MeData } from '@/types/auth/me';
import NavLink from './NavLink';
import HeaderUserDropdown from './HeaderUserDropdown';

export const NAV_ITEMS = [
  { href: '/', label: '홈' },
  { href: '/companies', label: '기업 검색' },
  { href: '/signup', label: '회원가입' },
] as const;

type NavigationProps = {
  isAuthenticated?: boolean;
  user: MeData | null;
};

const Navigation = ({ isAuthenticated = false, user }: NavigationProps) => {
  const items = isAuthenticated
    ? NAV_ITEMS.filter((item) => item.href !== '/signup' && item.href !== '/')
    : NAV_ITEMS;

  return (
    <nav
      className="hidden items-center gap-4 text-lg font-medium md:flex"
      aria-label="주요 메뉴"
    >
      {items.map((item) => (
        <NavLink key={item.href} href={item.href}>
          {item.label}
        </NavLink>
      ))}
      {isAuthenticated ? (
        <span className="border-l border-border pl-4 ml-2 flex items-center">
          <HeaderUserDropdown user={user} variant="iconWithLabel" />
        </span>
      ) : null}
    </nav>
  );
};

export default Navigation;
