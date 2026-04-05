'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';

function isActivePath(pathname: string, href: string, currentHash: string): boolean {
  const hashIndex = href.indexOf('#');
  if (hashIndex >= 0) {
    const baseHref = href.slice(0, hashIndex) || '/';
    const hashFragment = href.slice(hashIndex + 1);
    if (!hashFragment) return pathname === baseHref;
    return pathname === baseHref && currentHash === `#${hashFragment}`;
  }

  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

type NavLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  'aria-label'?: string;
};

const NavLink = ({
  href,
  children,
  className = '',
  onClick,
  'aria-label': ariaLabel,
}: NavLinkProps) => {
  const pathname = usePathname();
  const [currentHash, setCurrentHash] = useState('');

  useEffect(() => {
    setCurrentHash(window.location.hash || '');
  }, []);

  useEffect(() => {
    const onHashChange = () => setCurrentHash(window.location.hash || '');
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const active = isActivePath(pathname, href, currentHash);

  const activeCls = active
    ? 'font-semibold text-chart-up'
    : 'text-foreground hover:text-chart-up';

  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      aria-label={ariaLabel}
      onClick={onClick}
      className={`${className} transition-colors ${activeCls}`.trim()}
    >
      {children}
    </Link>
  );
};

export default NavLink;
