import { Home, Search, UserPlus } from 'lucide-react';
import React from 'react';
import Logo from '../common/Logo';
import NavLink from './NavLink';
import Navigation from './Navigation';
import HeaderUserDropdown from './HeaderUserDropdown';
import { cookies } from 'next/headers';
import { AUTH_ACCESS_TOKEN_COOKIE } from '@/constants/authCookies';
import { loadMe } from '@/services/auth/loadMe';

const Header = async () => {
  const isAuthenticated = Boolean(
    cookies().get(AUTH_ACCESS_TOKEN_COOKIE)?.value,
  );
  const user = isAuthenticated ? await loadMe() : null;

  return (
    <header className="relative z-50 flex min-h-14 items-center justify-between px-3 py-2 sm:min-h-[80px] sm:px-4 sm:py-4">
      <Logo />
      <Navigation isAuthenticated={isAuthenticated} user={user} />
      <nav
        className="flex items-center gap-0.5 md:hidden"
        aria-label="모바일 메뉴"
      >
        {!isAuthenticated ? (
          <NavLink
            href="/#signin"
            className="inline-flex rounded-lg p-2.5"
            aria-label="홈"
          >
            <Home className="h-6 w-6 shrink-0" aria-hidden />
          </NavLink>
        ) : null}
        <NavLink
          href="/companies"
          className="inline-flex rounded-lg p-2.5"
          aria-label="기업 검색"
        >
          <Search className="h-6 w-6 shrink-0" aria-hidden />
        </NavLink>
        {isAuthenticated ? (
          <HeaderUserDropdown user={user} variant="icon" />
        ) : (
          <NavLink
            href="/signup"
            className="inline-flex rounded-lg p-2.5"
            aria-label="회원가입"
          >
            <UserPlus className="h-6 w-6 shrink-0" aria-hidden />
          </NavLink>
        )}
      </nav>
    </header>
  );
};

export default Header;
